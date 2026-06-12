// Vercel serverless function — built-in AI tutor proxy (Gemini default).
// Env: AI_PROVIDER (gemini|openai|anthropic), AI_API_KEY, AI_MODEL.
// Handles: essay grading, speaking (transcript), speaking_audio (real audio),
// and translate (EN feedback -> Thai).

const ESSAY_SHAPE = `{"overall":<0-9>,"criteria":[{"name":"Task Achievement / Task Response","band":<0-9>,"comment":"..."},{"name":"Coherence and Cohesion","band":<0-9>,"comment":"..."},{"name":"Lexical Resource","band":<0-9>,"comment":"..."},{"name":"Grammatical Range and Accuracy","band":<0-9>,"comment":"..."}],"strengths":["..."],"improvements":["..."],"corrected_examples":[{"original":"...","better":"..."}],"summary":"..."}`
const SPEAK_SHAPE = `{"overall":<0-9>,"criteria":[{"name":"Fluency and Coherence","band":<0-9>,"comment":"..."},{"name":"Lexical Resource","band":<0-9>,"comment":"..."},{"name":"Grammatical Range and Accuracy","band":<0-9>,"comment":"..."},{"name":"Pronunciation","band":<0-9>,"comment":"..."}],"strengths":["..."],"improvements":["..."],"model_answer":"...","summary":"..."}`
const SPEAK_AUDIO_SHAPE = `{"transcript":"<what the candidate actually said>","overall":<0-9>,"criteria":[{"name":"Fluency and Coherence","band":<0-9>,"comment":"..."},{"name":"Lexical Resource","band":<0-9>,"comment":"..."},{"name":"Grammatical Range and Accuracy","band":<0-9>,"comment":"..."},{"name":"Pronunciation","band":<0-9>,"comment":"based on the actual audio"}],"mispronounced":[{"word":"...","issue":"how it sounded vs correct","tip":"how to fix"}],"strengths":["..."],"improvements":["..."],"model_answer":"...","summary":"..."}`

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function textParts(body) {
  if (body.kind === 'essay') {
    return [{ text: `You are a certified IELTS examiner. Assess the candidate's ${body.task} essay strictly against the public band descriptors.\n\nQUESTION:\n${body.prompt}\n\nCANDIDATE RESPONSE:\n${body.text}\n\nReturn ONLY valid JSON, no markdown:\n${ESSAY_SHAPE}` }]
  }
  if (body.kind === 'translate') {
    return [{ text: `Translate the values of these IELTS feedback fields into natural, friendly Thai. Keep the JSON structure and keys EXACTLY the same, translate only the human-readable text values (comment, strengths, improvements, summary, tip, issue). Do NOT translate field names or the "word"/"name" values. Return ONLY valid JSON.\n\n${JSON.stringify(body.payload)}` }]
  }
  // speaking (transcript)
  return [{ text: `You are a certified IELTS speaking examiner. Assess this Part ${body.part} answer against the public band descriptors based on the transcript.\n\nQUESTION: ${body.question}\n\nCANDIDATE TRANSCRIPT:\n${body.text}\n\nReturn ONLY valid JSON, no markdown:\n${SPEAK_SHAPE}` }]
}

function audioParts(body) {
  const prompt = `You are a certified IELTS speaking examiner. Listen to the candidate's spoken answer in the audio and assess it against the public band descriptors. Judge PRONUNCIATION from the actual audio: individual sounds, word stress, intonation and overall intelligibility. List specific words that were mispronounced with a short tip for each. Also transcribe what they said.\n\nQUESTION: Part ${body.part} — ${body.question}\n\nReturn ONLY valid JSON, no markdown:\n${SPEAK_AUDIO_SHAPE}`
  return [
    { inline_data: { mime_type: body.mimeType || 'audio/wav', data: body.audio } },
    { text: prompt },
  ]
}

// Discover which Gemini models actually exist for this key (model names change
// over time; old ones get retired). Cached per warm lambda.
let cachedModels = null
async function listGeminiModels(key) {
  if (cachedModels) return cachedModels
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`)
    if (!res.ok) return null
    const data = await res.json()
    const names = (data.models || [])
      .filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
      .map((m) => String(m.name).replace(/^models\//, ''))
    cachedModels = names
    return names
  } catch {
    return null
  }
}

function versionScore(n) { const m = n.match(/(\d+\.\d+)/); return m ? parseFloat(m[1]) : 0 }

function rankFlashModels(names) {
  const flash = names.filter((n) => /flash/i.test(n) && !/vision|embedding|image|tts|audio-|thinking|exp|preview/i.test(n))
  flash.sort((a, b) => versionScore(b) - versionScore(a))
  return flash.length ? flash : names
}

async function callGemini(parts, key, model) {
  let candidates
  if (model) {
    candidates = [model]
  } else {
    const names = await listGeminiModels(key)
    candidates = names ? rankFlashModels(names).slice(0, 4) : ['gemini-2.0-flash', 'gemini-flash-latest']
  }
  const reqBody = JSON.stringify({ contents: [{ parts }], generationConfig: { temperature: 0.3, responseMimeType: 'application/json' } })
  let lastErr = 'Gemini: no usable model found'
  for (const m of candidates) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`
      const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: reqBody })
      const txt = await res.text()
      if (res.ok) return JSON.parse(txt).candidates?.[0]?.content?.parts?.[0]?.text ?? ''
      lastErr = `Gemini ${res.status} (${m}): ${txt.slice(0, 200)}`
      if (res.status === 429 && attempt === 0) { await sleep(2000); continue }
      break // 404/400 etc -> try next discovered model
    }
  }
  throw new Error(lastErr)
}

async function callOpenAI(prompt, key, model) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer ' + key },
    body: JSON.stringify({ model: model || 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], temperature: 0.3 }),
  })
  const txt = await res.text()
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${txt.slice(0, 220)}`)
  return JSON.parse(txt).choices?.[0]?.message?.content ?? ''
}

async function callAnthropic(prompt, key, model) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: model || 'claude-3-5-sonnet-latest', max_tokens: 1500, messages: [{ role: 'user', content: prompt }] }),
  })
  const txt = await res.text()
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${txt.slice(0, 220)}`)
  return JSON.parse(txt).content?.[0]?.text ?? ''
}

function extractJson(text) {
  if (!text) return null
  const m = text.match(/\{[\s\S]*\}/)
  if (!m) return null
  try { return JSON.parse(m[0]) } catch { return null }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'method_not_allowed' }); return }
  const key = process.env.AI_API_KEY
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase()
  const model = process.env.AI_MODEL || ''
  if (!key) { res.status(200).json({ not_configured: true }); return }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
    let raw

    if (body.kind === 'speaking_audio') {
      // Audio assessment requires a multimodal model — Gemini only.
      if (provider !== 'gemini') { res.status(200).json({ error: 'การตรวจเสียงต้องใช้ Gemini เท่านั้น' }); return }
      raw = await callGemini(audioParts(body), key, model)
    } else {
      const parts = textParts(body)
      const promptText = parts[0].text
      if (provider === 'openai') raw = await callOpenAI(promptText, key, model)
      else if (provider === 'anthropic') raw = await callAnthropic(promptText, key, model)
      else raw = await callGemini(parts, key, model)
    }

    const parsed = extractJson(raw)
    if (!parsed) { res.status(200).json({ error: 'AI ตอบกลับมาในรูปแบบที่อ่านไม่ได้ ลองใหม่อีกครั้ง' }); return }
    res.status(200).json(parsed)
  } catch (e) {
    const msg = String(e && e.message ? e.message : e)
    console.error('[grade] provider=' + provider + ' error=' + msg)
    res.status(200).json({ error: msg })
  }
}
