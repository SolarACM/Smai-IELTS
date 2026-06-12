// Vercel serverless function — built-in AI tutor proxy.
// The owner's API key lives in Vercel Environment Variables (never exposed to users).
// Env vars: AI_PROVIDER (gemini|openai|anthropic, default gemini), AI_API_KEY, AI_MODEL.

const ESSAY_SHAPE = `{"overall":<0-9>,"criteria":[{"name":"Task Achievement / Task Response","band":<0-9>,"comment":"..."},{"name":"Coherence and Cohesion","band":<0-9>,"comment":"..."},{"name":"Lexical Resource","band":<0-9>,"comment":"..."},{"name":"Grammatical Range and Accuracy","band":<0-9>,"comment":"..."}],"strengths":["..."],"improvements":["..."],"corrected_examples":[{"original":"...","better":"..."}],"summary":"..."}`
const SPEAKING_SHAPE = `{"overall":<0-9>,"criteria":[{"name":"Fluency and Coherence","band":<0-9>,"comment":"..."},{"name":"Lexical Resource","band":<0-9>,"comment":"..."},{"name":"Grammatical Range and Accuracy","band":<0-9>,"comment":"..."},{"name":"Pronunciation","band":<0-9>,"comment":"from transcript only"}],"strengths":["..."],"improvements":["..."],"model_answer":"...","summary":"..."}`

function buildPrompt(body) {
  if (body.kind === 'essay') {
    return `You are a certified IELTS examiner. Assess the candidate's ${body.task} essay strictly against the public band descriptors.\n\nQUESTION:\n${body.prompt}\n\nCANDIDATE RESPONSE:\n${body.text}\n\nReturn ONLY valid JSON, no markdown, in this exact shape:\n${ESSAY_SHAPE}`
  }
  return `You are a certified IELTS speaking examiner. Assess this Part ${body.part} answer against the public band descriptors based on the transcript.\n\nQUESTION: ${body.question}\n\nCANDIDATE TRANSCRIPT:\n${body.text}\n\nReturn ONLY valid JSON, no markdown:\n${SPEAKING_SHAPE}`
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function callGemini(prompt, key, model) {
  // Try the configured model first, then sensible fallbacks. Retry once on 429.
  const models = model ? [model] : ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-flash-latest', 'gemini-1.5-flash']
  const reqBody = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.3, responseMimeType: 'application/json' },
  })
  let lastErr = 'Gemini: unknown error'
  for (const m of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: reqBody,
      })
      const txt = await res.text()
      if (res.ok) {
        const data = JSON.parse(txt)
        return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
      }
      lastErr = `Gemini ${res.status} (${m}): ${txt.slice(0, 220)}`
      if (res.status === 429 && attempt === 0) {
        await sleep(2000) // brief backoff then retry the same model once
        continue
      }
      break // non-retryable or already retried -> try next model
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
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${txt.slice(0, 300)}`)
  return JSON.parse(txt).choices?.[0]?.message?.content ?? ''
}

async function callAnthropic(prompt, key, model) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: model || 'claude-3-5-sonnet-latest', max_tokens: 1500, messages: [{ role: 'user', content: prompt }] }),
  })
  const txt = await res.text()
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${txt.slice(0, 300)}`)
  return JSON.parse(txt).content?.[0]?.text ?? ''
}

function extractJson(text) {
  if (!text) return null
  const m = text.match(/\{[\s\S]*\}/)
  if (!m) return null
  try { return JSON.parse(m[0]) } catch { return null }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method_not_allowed' })
    return
  }
  const key = process.env.AI_API_KEY
  const provider = (process.env.AI_PROVIDER || 'gemini').toLowerCase()
  const model = process.env.AI_MODEL || ''

  if (!key) {
    res.status(200).json({ not_configured: true })
    return
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {}
    const prompt = buildPrompt(body)
    let raw
    if (provider === 'openai') raw = await callOpenAI(prompt, key, model)
    else if (provider === 'anthropic') raw = await callAnthropic(prompt, key, model)
    else raw = await callGemini(prompt, key, model)

    const parsed = extractJson(raw)
    if (!parsed) {
      res.status(200).json({ error: 'AI ตอบกลับมาในรูปแบบที่อ่านไม่ได้ ลองใหม่อีกครั้ง' })
      return
    }
    res.status(200).json(parsed)
  } catch (e) {
    const msg = String(e && e.message ? e.message : e)
    console.error('[grade] provider=' + provider + ' error=' + msg)
    res.status(200).json({ error: msg })
  }
}
