import { useMemo, useState, useEffect } from 'react'
import { listeningSections } from '../data/listening.js'
import { useSpeech } from '../hooks/useSpeech.js'
import { logAttempt } from '../lib/store.js'

function normalize(str) {
  return String(str).trim().toLowerCase().replace(/[.,!?;:]/g, '')
}

export default function Listening() {
  const [sid, setSid] = useState(listeningSections[0].id)
  const section = useMemo(() => listeningSections.find((s) => s.id === sid), [sid])
  const [accent, setAccent] = useState(section.accentDefault)
  const [rate, setRate] = useState(0.95)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [showScript, setShowScript] = useState(false)
  const sp = useSpeech()

  useEffect(() => {
    return () => sp.stop()
  }, [sid]) // eslint-disable-line

  const pick = (id) => {
    sp.stop()
    setSid(id)
    const s = listeningSections.find((x) => x.id === id)
    setAccent(s.accentDefault)
    setAnswers({})
    setSubmitted(false)
    setShowScript(false)
  }

  const play = () => sp.speak(section.script, { lang: accent, rate })
  const setAns = (qid, v) => setAnswers((a) => ({ ...a, [qid]: v }))

  const isCorrect = (q) => {
    const a = answers[q.id]
    if (a == null || a === '') return false
    if (q.type === 'mc') return a === q.answer
    return q.answer.map(normalize).includes(normalize(a))
  }
  const score = section.questions.filter(isCorrect).length

  const submit = () => {
    setSubmitted(true)
    sp.stop()
    logAttempt({ skill: 'listening', sectionId: section.id, score, total: section.questions.length })
  }

  return (
    <div className="container-app py-10">
      <header>
        <span className="chip bg-ember-50 text-ember-700">Listening</span>
        <h1 className="mt-3 text-4xl">ฝึกฟัง — เสียง Native</h1>
        <p className="mt-2 max-w-2xl text-navy-500">
          กดเล่นเสียงเจ้าของภาษา (เลือกสำเนียง US/UK) ฟังแล้วตอบคำถาม กดส่งเพื่อดูคะแนน + สคริปต์
        </p>
      </header>

      <div className="mt-6 flex flex-wrap gap-2">
        {listeningSections.map((s) => (
          <button key={s.id} onClick={() => pick(s.id)}
            className={'rounded-full px-4 py-2 text-sm font-semibold ring-1 transition ' + (s.id === sid ? 'bg-ink text-white ring-ink' : 'bg-white text-navy-600 ring-navy-100 hover:bg-navy-50')}>
            {s.title}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[0.85fr_1fr]">
        {/* player */}
        <div>
          <div className="card overflow-hidden">
            <div className="border-b border-navy-100 bg-navy-50/60 px-5 py-3 text-xs font-semibold text-navy-400">
              {section.title}
            </div>
            <div className="p-5">
              <p className="text-sm text-navy-500">{section.context}</p>

              {!sp.supported && (
                <p className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-600">
                  เบราว์เซอร์นี้ไม่รองรับเสียงสังเคราะห์ ลองใช้ Chrome หรือ Edge บนคอมพิวเตอร์
                </p>
              )}

              {/* accent + speed */}
              <div className="mt-4 space-y-3">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-navy-500">สำเนียง</span>
                  <div className="mt-1.5 flex gap-2">
                    {[['en-US', '🇺🇸 American'], ['en-GB', '🇬🇧 British']].map(([code, label]) => (
                      <button key={code} onClick={() => setAccent(code)}
                        className={'flex-1 rounded-lg px-3 py-2 text-sm font-semibold ring-1 transition ' + (accent === code ? 'bg-ink text-white ring-ink' : 'bg-white text-navy-600 ring-navy-100 hover:bg-navy-50')}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-navy-500">ความเร็ว: {rate.toFixed(2)}x</span>
                  <input type="range" min="0.6" max="1.2" step="0.05" value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value))} className="mt-1 w-full accent-ember-500" />
                </div>
              </div>

              {/* controls */}
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {!sp.speaking ? (
                  <button onClick={play} disabled={!sp.supported} className="btn-primary px-5 py-2 text-sm disabled:opacity-40">▶ เล่นเสียง</button>
                ) : sp.paused ? (
                  <button onClick={sp.resume} className="btn-dark px-5 py-2 text-sm">▶ เล่นต่อ</button>
                ) : (
                  <button onClick={sp.pause} className="btn-ghost px-5 py-2 text-sm">⏸ พัก</button>
                )}
                <button onClick={sp.stop} className="btn-ghost px-4 py-2 text-sm">■ หยุด</button>
                {sp.speaking && <span className="flex items-center gap-1.5 text-xs text-ember-600"><span className="inline-block h-2 w-2 animate-pulse rounded-full bg-ember-500" /> กำลังเล่น</span>}
              </div>
              <p className="mt-3 text-xs text-navy-400">เคล็ดลับ: ฟังแบบสอบจริงคือฟังครั้งเดียว ลองอย่ากดเล่นซ้ำเยอะ</p>
            </div>
          </div>

          {submitted && (
            <div className="card mt-4 p-5">
              <button onClick={() => setShowScript((v) => !v)} className="text-sm font-semibold text-navy-700">
                {showScript ? 'ซ่อนสคริปต์' : 'ดูสคริปต์ (transcript)'}
              </button>
              {showScript && (
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-navy-600">{section.script}</p>
              )}
            </div>
          )}
        </div>

        {/* questions */}
        <div>
          <div className="space-y-4">
            {section.questions.map((q, i) => {
              const ok = submitted && isCorrect(q)
              const bad = submitted && !isCorrect(q)
              return (
                <div key={q.id} className={'card p-4 ' + (ok ? 'ring-2 ring-emerald-300' : bad ? 'ring-2 ring-rose-200' : '')}>
                  <p className="text-sm font-semibold text-ink"><span className="text-ember-500">{i + 1}.</span> {q.q}</p>
                  {q.type === 'mc' ? (
                    <div className="mt-2 space-y-1.5">
                      {q.options.map((opt, oi) => (
                        <button key={oi} disabled={submitted} onClick={() => setAns(q.id, oi)}
                          className={'block w-full rounded-lg px-3 py-2 text-left text-sm ring-1 transition ' + (answers[q.id] === oi ? 'bg-navy-50 ring-navy-300' : 'bg-white ring-navy-100 hover:bg-navy-50')}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input disabled={submitted} value={answers[q.id] || ''} onChange={(e) => setAns(q.id, e.target.value)}
                      placeholder="พิมพ์คำตอบ"
                      className="mt-2 w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm outline-none focus:border-ember-400" />
                  )}
                  {submitted && (
                    <p className={'mt-2 text-xs ' + (isCorrect(q) ? 'text-emerald-700' : 'text-rose-600')}>
                      เฉลย: <strong>{q.type === 'mc' ? q.options[q.answer] : q.answer.join(' / ')}</strong> — {q.why}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          {!submitted ? (
            <button onClick={submit} className="btn-primary mt-5 w-full">ส่งคำตอบ</button>
          ) : (
            <div className="card mt-5 p-5 text-center">
              <p className="text-sm text-navy-500">คะแนนของคุณ</p>
              <p className="font-display text-4xl font-bold text-ember-500">{score}/{section.questions.length}</p>
              <button onClick={() => pick(section.id)} className="btn-ghost mt-3 px-5 py-1.5 text-xs">ทำใหม่</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
