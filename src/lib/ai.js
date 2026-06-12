// AI grading layer with three paths, in priority order:
//   1. User's own key (Settings)  -> call provider directly from browser.
//   2. Built-in tutor (default)   -> POST /api/grade (owner's key lives on Vercel).
//   3. Offline fallback           -> local heuristic self-check (always works).

import { getSettings } from './store.js'

const ESSAY_CRITERIA = [
  'Task Achievement / Task Response',
  'Coherence and Cohesion',
  'Lexical Resource',
  'Grammatical Range and Accuracy',
]
const SPEAKING_CRITERIA = [
  'Fluency and Coherence',
  'Lexical Resource',
  'Grammatical Range and Accuracy',
  'Pronunciation',
]

function essayPrompt({ task, prompt, essay }) {
  return `You are a certified IELTS examiner. Assess the candidate's ${task} essay strictly against the public band descriptors.

QUESTION:
${prompt}

CANDIDATE RESPONSE:
${essay}

Return ONLY valid JSON, no markdown:
{"overall":<0-9>,"criteria":[{"name":"Task Achievement / Task Response","band":<0-9>,"comment":"..."},{"name":"Coherence and Cohesion","band":<0-9>,"comment":"..."},{"name":"Lexical Resource","band":<0-9>,"comment":"..."},{"name":"Grammatical Range and Accuracy","band":<0-9>,"comment":"..."}],"strengths":["..."],"improvements":["..."],"corrected_examples":[{"original":"...","better":"..."}],"summary":"..."}`
}

function speakingPrompt({ part, question, transcript }) {
  return `You are a certified IELTS speaking examiner. Assess this Part ${part} answer against the public band descriptors based on the transcript.

QUESTION: ${question}

CANDIDATE TRANSCRIPT:
${transcript}

Return ONLY valid JSON, no markdown:
{"overall":<0-9>,"criteria":[{"name":"Fluency and Coherence","band":<0-9>,"comment":"..."},{"name":"Lexical Resource","band":<0-9>,"comment":"..."},{"name":"Grammatical Range and Accuracy","band":<0-9>,"comment":"..."},{"name":"Pronunciation","band":<0-9>,"comment":"from transcript only"}],"strengths":["..."],"improvements":["..."],"model_answer":"...","summary":"..."}`
}

function extractJson(text) {
  if (!text) return null
  const m = text.match(/\{[\s\S]*\}/)
  if (!m) return null
  try { return JSON.parse(m[0]) } catch { return null }
}

// ---- direct provider calls (when the user supplies their own key) ----
async function callDirect(promptText) {
  const s = getSettings()
  if (!s.apiKey) return null

  if (s.provider === 'gemini') {
    const model = s.model || 'gemini-2.0-flash'
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${s.apiKey}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: { temperature: 0.3, responseMimeType: 'application/json' },
        }),
      },
    )
    if (!res.ok) throw new Error('Gemini API error ' + res.status)
    const data = await res.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  }

  if (s.provider === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': s.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: s.model || 'claude-3-5-sonnet-latest',
        max_tokens: 1500,
        messages: [{ role: 'user', content: promptText }],
      }),
    })
    if (!res.ok) throw new Error('Anthropic API error ' + res.status)
    const data = await res.json()
    return data.content?.[0]?.text ?? ''
  }

  // openai-compatible
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer ' + s.apiKey },
    body: JSON.stringify({
      model: s.model || 'gpt-4o-mini',
      messages: [{ role: 'user', content: promptText }],
      temperature: 0.3,
    }),
  })
  if (!res.ok) throw new Error('OpenAI API error ' + res.status)
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

// ---- built-in tutor via serverless proxy ----
async function callProxy(payload) {
  let res
  try {
    res = await fetch('/api/grade', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    return null // network unreachable -> offline fallback
  }
  if (!res.ok) return null
  let data
  try { data = await res.json() } catch { return null }
  if (data && data.not_configured) return null // owner has not set a key -> offline
  if (data && data.error) throw new Error('AI: ' + data.error) // surface real error to user
  return data
}

// ---- offline heuristics ----
function offlineEssay({ task, essay }) {
  const words = (essay.trim().match(/\S+/g) || []).length
  const minWords = task === 'Task 1' ? 150 : 250
  const sentences = (essay.match(/[.!?]+/g) || []).length || 1
  const avgLen = Math.round(words / sentences)
  const notes = []
  if (words < minWords) notes.push(`เขียนได้ ${words} คำ — ยังไม่ถึงเกณฑ์ขั้นต่ำ ${minWords} คำ (ถูกหักคะแนน Task)`)
  else notes.push(`จำนวนคำผ่านเกณฑ์ (${words}/${minWords})`)
  if (avgLen > 28) notes.push('ประโยคยาวเฉลี่ยมาก ลองแบ่งประโยคให้กระชับขึ้น')
  if (avgLen < 10) notes.push('ประโยคสั้นมาก ลองเชื่อมเป็น complex sentence เพื่อดัน Grammar band')
  return {
    offline: true, overall: null, wordCount: words, minWords,
    criteria: ESSAY_CRITERIA.map((name) => ({ name, band: null, comment: '' })),
    checklist: notes,
    summary: 'โหมดออฟไลน์: ระบบ AI ยังไม่พร้อม (เจ้าของเว็บยังไม่ได้ตั้งค่า key หลังบ้าน) ใช้ checklist + band descriptor + model answer เพื่อประเมินตัวเองก่อนได้',
  }
}
function offlineSpeaking({ transcript }) {
  const words = (transcript.trim().match(/\S+/g) || []).length
  return {
    offline: true, overall: null, wordCount: words,
    criteria: SPEAKING_CRITERIA.map((name) => ({ name, band: null, comment: '' })),
    checklist: [
      words < 40 ? 'พูดสั้นไป ลองเพิ่มเหตุผล + ตัวอย่าง' : 'ความยาวคำตอบกำลังดี',
      'อัดเสียงแล้วฟังซ้ำ จับ filler (um, like) และการหยุดยาว',
      'เทียบกับ band descriptor ด้านล่างทีละข้อ',
    ],
    summary: 'โหมดออฟไลน์: ระบบ AI ยังไม่พร้อม ใช้ band descriptor + model answer เพื่อประเมินตัวเองก่อนได้',
  }
}

// ---- public API ----
export function aiEnabled() {
  return true // built-in tutor is the default path; offline is a graceful fallback
}

export async function gradeEssay({ task, prompt, essay }) {
  const s = getSettings()
  if (s.apiKey) {
    const raw = await callDirect(essayPrompt({ task, prompt, essay }))
    const parsed = extractJson(raw)
    if (parsed) { parsed.offline = false; parsed.wordCount = (essay.trim().match(/\S+/g) || []).length; return parsed }
  }
  const proxied = await callProxy({ kind: 'essay', task, prompt, text: essay })
  if (proxied) { proxied.offline = false; proxied.wordCount = (essay.trim().match(/\S+/g) || []).length; return proxied }
  return offlineEssay({ task, essay })
}

export async function gradeSpeaking({ part, question, transcript }) {
  const s = getSettings()
  if (s.apiKey) {
    const raw = await callDirect(speakingPrompt({ part, question, transcript }))
    const parsed = extractJson(raw)
    if (parsed) { parsed.offline = false; return parsed }
  }
  const proxied = await callProxy({ kind: 'speaking', part, question, text: transcript })
  if (proxied) { proxied.offline = false; return proxied }
  return offlineSpeaking({ transcript })
}

// ---- audio pronunciation (Gemini multimodal) ----
async function geminiDirectParts(parts, key, model) {
  const m = model || 'gemini-2.0-flash'
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }], generationConfig: { temperature: 0.3, responseMimeType: 'application/json' } }),
    },
  )
  const txt = await res.text()
  if (!res.ok) throw new Error('AI: Gemini ' + res.status + ': ' + txt.slice(0, 200))
  return JSON.parse(txt).candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

export async function gradeSpeakingAudio({ part, question, audioBase64, mimeType }) {
  const s = getSettings()
  // user's own Gemini key -> call directly
  if (s.apiKey && s.provider === 'gemini') {
    const prompt = `You are a certified IELTS speaking examiner. Listen to the candidate's spoken answer in the audio and assess it against the public band descriptors. Judge PRONUNCIATION from the actual audio: individual sounds, word stress, intonation and intelligibility. List specific mispronounced words with a tip each. Also transcribe what they said.\n\nQUESTION: Part ${part} — ${question}\n\nReturn ONLY valid JSON: {"transcript":"...","overall":<0-9>,"criteria":[{"name":"Fluency and Coherence","band":<0-9>,"comment":"..."},{"name":"Lexical Resource","band":<0-9>,"comment":"..."},{"name":"Grammatical Range and Accuracy","band":<0-9>,"comment":"..."},{"name":"Pronunciation","band":<0-9>,"comment":"from the audio"}],"mispronounced":[{"word":"...","issue":"...","tip":"..."}],"strengths":["..."],"improvements":["..."],"model_answer":"...","summary":"..."}`
    const raw = await geminiDirectParts(
      [{ inline_data: { mime_type: mimeType || 'audio/wav', data: audioBase64 } }, { text: prompt }],
      s.apiKey,
      s.model,
    )
    const parsed = extractJson(raw)
    if (parsed) { parsed.offline = false; return parsed }
  }
  // built-in tutor proxy
  const proxied = await callProxy({ kind: 'speaking_audio', part, question, audio: audioBase64, mimeType })
  if (proxied) { proxied.offline = false; return proxied }
  return {
    offline: true,
    summary: 'การตรวจการออกเสียงต้องใช้ AI (เจ้าของเว็บยังไม่ได้ตั้งค่า key หลังบ้าน หรือโควต้าหมด) — ใช้โหมดถอดข้อความให้ band แทนได้ก่อน',
    criteria: [],
  }
}

// ---- translate feedback EN -> Thai ----
export async function translateResult(result) {
  const payload = {
    criteria: (result.criteria || []).map((c) => ({ name: c.name, comment: c.comment })),
    strengths: result.strengths || [],
    improvements: result.improvements || [],
    summary: result.summary || '',
    mispronounced: (result.mispronounced || []).map((m) => ({ word: m.word, issue: m.issue, tip: m.tip })),
  }
  const s = getSettings()
  if (s.apiKey) {
    const prompt = `Translate the human-readable text values of this IELTS feedback JSON into natural friendly Thai. Keep the same JSON structure and keys; translate only comment/strengths/improvements/summary/issue/tip values. Do NOT translate the "name" or "word" values. Return ONLY valid JSON.\n\n${JSON.stringify(payload)}`
    try {
      const raw = await callDirect(prompt)
      const parsed = extractJson(raw)
      if (parsed) return parsed
    } catch { /* fall through to proxy */ }
  }
  const proxied = await callProxy({ kind: 'translate', payload })
  return proxied || null
}

export { ESSAY_CRITERIA, SPEAKING_CRITERIA }
