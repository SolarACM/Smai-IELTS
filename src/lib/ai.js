// Pluggable AI grading layer.
// Works in two modes:
//   1. ONLINE  — if the user has saved an API key in Settings, we call the
//      provider directly from the browser and return structured band feedback.
//   2. OFFLINE — no key: we return a local heuristic self-check so the app is
//      still useful (word count, timing, rubric reminders). Clearly labelled.
//
// The prompts ask the model to behave like a certified IELTS examiner and to
// return strict JSON so the UI can render band scores per criterion.

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

function buildEssayPrompt({ task, prompt, essay }) {
  return `You are a certified IELTS examiner. Assess the candidate's ${task} essay strictly against the public band descriptors.

QUESTION:
${prompt}

CANDIDATE RESPONSE:
${essay}

Return ONLY valid JSON, no markdown, in this exact shape:
{
  "overall": <number 0-9, .5 steps>,
  "criteria": [
    {"name": "Task Achievement / Task Response", "band": <0-9>, "comment": "<1-2 sentences>"},
    {"name": "Coherence and Cohesion", "band": <0-9>, "comment": "..."},
    {"name": "Lexical Resource", "band": <0-9>, "comment": "..."},
    {"name": "Grammatical Range and Accuracy", "band": <0-9>, "comment": "..."}
  ],
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "corrected_examples": [{"original": "...", "better": "..."}],
  "summary": "<2-3 sentence overall verdict in English>"
}`
}

function buildSpeakingPrompt({ part, question, transcript }) {
  return `You are a certified IELTS speaking examiner. Assess this Part ${part} answer against the public band descriptors based on the transcript.

QUESTION: ${question}

CANDIDATE TRANSCRIPT:
${transcript}

Return ONLY valid JSON, no markdown:
{
  "overall": <0-9, .5 steps>,
  "criteria": [
    {"name": "Fluency and Coherence", "band": <0-9>, "comment": "..."},
    {"name": "Lexical Resource", "band": <0-9>, "comment": "..."},
    {"name": "Grammatical Range and Accuracy", "band": <0-9>, "comment": "..."},
    {"name": "Pronunciation", "band": <0-9>, "comment": "note: judged from transcript only"}
  ],
  "strengths": ["..."],
  "improvements": ["..."],
  "model_answer": "<a band 8+ sample answer to the same question>",
  "summary": "<2-3 sentence verdict>"
}`
}

async function callProvider(promptText) {
  const s = getSettings()
  if (!s.apiKey) return null

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
        model: s.model || 'claude-sonnet-4-5',
        max_tokens: 1500,
        messages: [{ role: 'user', content: promptText }],
      }),
    })
    if (!res.ok) throw new Error('Anthropic API error ' + res.status)
    const data = await res.json()
    return data.content?.[0]?.text ?? ''
  }

  // default: OpenAI-compatible
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: 'Bearer ' + s.apiKey,
    },
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

function extractJson(text) {
  if (!text) return null
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return null
  try {
    return JSON.parse(match[0])
  } catch {
    return null
  }
}

// ---- Offline heuristics -------------------------------------------------

function offlineEssay({ task, essay }) {
  const words = (essay.trim().match(/\S+/g) || []).length
  const minWords = task === 'Task 1' ? 150 : 250
  const sentences = (essay.match(/[.!?]+/g) || []).length || 1
  const avgLen = Math.round(words / sentences)
  const notes = []
  if (words < minWords)
    notes.push(`เขียนได้ ${words} คำ — ยังไม่ถึงเกณฑ์ขั้นต่ำ ${minWords} คำ (ถูกหักคะแนน Task)`)
  else notes.push(`จำนวนคำผ่านเกณฑ์ (${words}/${minWords})`)
  if (avgLen > 28) notes.push('ประโยคยาวเฉลี่ยมาก ลองแบ่งประโยคให้กระชับขึ้น')
  if (avgLen < 10) notes.push('ประโยคสั้นมาก ลองเชื่อมประโยคด้วย complex sentence เพื่อดัน Grammar band')
  return {
    offline: true,
    overall: null,
    wordCount: words,
    minWords,
    criteria: ESSAY_CRITERIA.map((name) => ({ name, band: null, comment: '' })),
    checklist: notes,
    summary:
      'โหมดออฟไลน์: ระบบยังไม่ได้เชื่อม AI จึงให้คะแนน band ไม่ได้ ใช้ checklist + band descriptor + model answer เพื่อประเมินตัวเองก่อน แล้วเปิด AI ใน Settings เพื่อรับคะแนนเต็มรูปแบบ',
  }
}

function offlineSpeaking({ transcript }) {
  const words = (transcript.trim().match(/\S+/g) || []).length
  return {
    offline: true,
    overall: null,
    wordCount: words,
    criteria: SPEAKING_CRITERIA.map((name) => ({ name, band: null, comment: '' })),
    checklist: [
      words < 40
        ? 'พูดสั้นไป IELTS อยากเห็นคำตอบที่ขยายความ ลองเพิ่มเหตุผล + ตัวอย่าง'
        : 'ความยาวคำตอบกำลังดี',
      'อัดเสียงแล้วฟังซ้ำ จับ filler (um, like), การหยุดยาว, และคำที่ออกเสียงผิด',
      'เทียบกับ band descriptor ด้านล่างทีละข้อ',
    ],
    summary:
      'โหมดออฟไลน์: เปิด AI ใน Settings เพื่อให้ตรวจ transcript และให้ band + model answer อัตโนมัติ',
  }
}

// ---- Public API ---------------------------------------------------------

export function aiEnabled() {
  return !!getSettings().apiKey
}

export async function gradeEssay({ task, prompt, essay }) {
  if (!aiEnabled()) return offlineEssay({ task, essay })
  const raw = await callProvider(buildEssayPrompt({ task, prompt, essay }))
  const parsed = extractJson(raw)
  if (!parsed) throw new Error('ไม่สามารถอ่านผลจาก AI ได้ ลองใหม่อีกครั้ง')
  parsed.offline = false
  parsed.wordCount = (essay.trim().match(/\S+/g) || []).length
  return parsed
}

export async function gradeSpeaking({ part, question, transcript }) {
  if (!aiEnabled()) return offlineSpeaking({ transcript })
  const raw = await callProvider(buildSpeakingPrompt({ part, question, transcript }))
  const parsed = extractJson(raw)
  if (!parsed) throw new Error('ไม่สามารถอ่านผลจาก AI ได้ ลองใหม่อีกครั้ง')
  parsed.offline = false
  return parsed
}

export { ESSAY_CRITERIA, SPEAKING_CRITERIA }
