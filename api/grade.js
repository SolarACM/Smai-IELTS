// Vercel serverless function — built-in AI tutor proxy.
// The owner's API key lives in Vercel Environment Variables (never exposed to users).
// Supports Gemini (default), OpenAI, and Anthropic.
//
// Env vars (set in Vercel → Settings → Environment Variables):
//   AI_PROVIDER = gemini | openai | anthropic   (default: gemini)
//   AI_API_KEY  = <your secret key>
//   AI_MODEL    = optional model override

const ESSAY_SHAPE = `{
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
  "summary": "<2-3 sentence verdict in English>"
}`

const SPEAKING_SHAPE = `{
  "overall": <0-9, .5 steps>,
  "criteria": [
    {"name": "Fluency and Coherence", "band": <0-9>, "comment": "..."},
    {"name": "Lexical Resource", "band": <0-9>, "comment": "..."},
    {"name": "Grammatical Range and Accuracy", "band": <0-9>, "comment": "..."},
    {"name": "Pronunciation", "band": <0-9>, "comment": "judged from transcript only"}
  ],
  "strengths": ["..."],
  "improvements": ["..."],
  "model_answer": "<a band 8+ sample answer to the same question>",
  "summary": "<2-3 sentence verdict>"
}`

function buildPrompt(body) {
  if (body.kind === 'essay') {
    return `You are a certified IELTS examiner. Assess the candidate's ${body.task} essay strictly against the public band descriptors.

QUESTION:
${body.prompt}

CANDIDATE RESPONSE:
${body.text}

Return ONLY valid JSON, no markdown, in this exact shape:
${ESSAY_SHAPE}`
  }
  return `You are a certified IELTS speaking examiner. Assess this Part ${body.part} answer against the public band descriptors based on the transcript.

QUESTION: ${body.question}

CANDIDATE TRANSCRIPT:
${body.text}

Return ONLY valid JSON, no markdown:
${SPEAKING_SHAPE}`
}

async function callGemini(prompt, key, model) {
  const m = model || 'gemini-2.0-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, responseMimeType: 'application/json' },
    }),
  })
  if (!res.ok) throw new Error('Gemini ' + res.status + ' ' + (await res.text()).slice(0, 200))
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

async function callOpenAI(prompt, key, model) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer ' + key },
    body: JSON.stringify({
      model: model || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    }),
  })
  if (!res.ok) throw new Error('OpenAI ' + res.status)
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}

async function callAnthropic(prompt, key, model) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: model || 'claude-3-5-sonnet-latest',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!res.ok) throw new Error('Anthropic ' + res.status)
  const data = await res.json()
  return data.content?.[0]?.text ?? ''
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
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const prompt = buildPrompt(body)
    let raw
    if (provider === 'openai') raw = await callOpenAI(prompt, key, model)
    else if (provider === 'anthropic') raw = await callAnthropic(prompt, key, model)
    else raw = await callGemini(prompt, key, model)

    const parsed = extractJson(raw)
    if (!parsed) {
      res.status(502).json({ error: 'bad_ai_response' })
      return
    }
    res.status(200).json(parsed)
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) })
  }
}
