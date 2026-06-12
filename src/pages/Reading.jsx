import { useMemo, useState } from 'react'
import { readingPassages } from '../data/reading.js'
import { useTimer, fmt } from '../hooks/useTimer.js'
import { logAttempt } from '../lib/store.js'

const TFNG = ['True', 'False', 'Not Given']

function normalize(str) {
  return String(str).trim().toLowerCase().replace(/[.,!?;:]/g, '')
}

export default function Reading() {
  const [pid, setPid] = useState(readingPassages[0].id)
  const passage = useMemo(() => readingPassages.find((p) => p.id === pid), [pid])
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const timer = useTimer(passage.minutes * 60)

  const pick = (id) => {
    setPid(id)
    setAnswers({})
    setSubmitted(false)
    const p = readingPassages.find((x) => x.id === id)
    timer.reset(p.minutes * 60)
  }

  const setAns = (qid, v) => setAnswers((a) => ({ ...a, [qid]: v }))

  const isCorrect = (q) => {
    const a = answers[q.id]
    if (a == null || a === '') return false
    if (q.type === 'mc') return a === q.answer
    if (q.type === 'gap') return q.answer.map(normalize).includes(normalize(a))
    return a === q.answer // tfng
  }

  const score = passage.questions.filter(isCorrect).length

  const submit = () => {
    setSubmitted(true)
    timer.pause()
    logAttempt({ skill: 'reading', passageId: passage.id, score, total: passage.questions.length })
  }

  return (
    <div className="container-app py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="chip bg-ember-50 text-ember-700">Reading</span>
          <h1 className="mt-3 text-4xl">ฝึกอ่าน + จับเวลา</h1>
          <p className="mt-2 max-w-2xl text-navy-500">อ่าน passage แล้วตอบคำถาม กดส่งเพื่อดูคะแนนและเฉลยพร้อมเหตุผล</p>
        </div>
        <div className="text-right">
          <div className="font-display text-3xl font-bold tabular-nums text-ink">{fmt(timer.remaining)}</div>
          <div className="mt-1 flex gap-2">
            {!timer.running ? (
              <button onClick={timer.start} className="btn-dark px-4 py-1.5 text-xs">▶ จับเวลา</button>
            ) : (
              <button onClick={timer.pause} className="btn-ghost px-4 py-1.5 text-xs">⏸ พัก</button>
            )}
            <button onClick={() => timer.reset(passage.minutes * 60)} className="btn-ghost px-4 py-1.5 text-xs">รีเซ็ต</button>
          </div>
        </div>
      </header>

      {readingPassages.length > 1 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {readingPassages.map((p) => (
            <button key={p.id} onClick={() => pick(p.id)}
              className={'rounded-full px-4 py-2 text-sm font-semibold ring-1 transition ' + (p.id === pid ? 'bg-ink text-white ring-ink' : 'bg-white text-navy-600 ring-navy-100 hover:bg-navy-50')}>
              {p.title}
            </button>
          ))}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* passage */}
        <div className="card max-h-[70vh] overflow-y-auto p-6">
          <h2 className="text-2xl">{passage.title}</h2>
          {passage.text.split('\n\n').map((para, i) => (
            <p key={i} className="mt-3 text-[15px] leading-relaxed text-navy-700">{para}</p>
          ))}
        </div>

        {/* questions */}
        <div>
          <div className="space-y-4">
            {passage.questions.map((q, i) => {
              const ok = submitted && isCorrect(q)
              const bad = submitted && !isCorrect(q)
              return (
                <div key={q.id} className={'card p-4 ' + (ok ? 'ring-2 ring-emerald-300' : bad ? 'ring-2 ring-rose-200' : '')}>
                  <p className="text-sm font-semibold text-ink">
                    <span className="text-ember-500">{i + 1}.</span> {q.q}
                  </p>

                  {q.type === 'tfng' && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {TFNG.map((opt) => (
                        <button key={opt} disabled={submitted} onClick={() => setAns(q.id, opt)}
                          className={'rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ' + (answers[q.id] === opt ? 'bg-navy-700 text-white ring-navy-700' : 'bg-white text-navy-600 ring-navy-100 hover:bg-navy-50')}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {q.type === 'mc' && (
                    <div className="mt-2 space-y-1.5">
                      {q.options.map((opt, oi) => (
                        <button key={oi} disabled={submitted} onClick={() => setAns(q.id, oi)}
                          className={'block w-full rounded-lg px-3 py-2 text-left text-sm ring-1 transition ' + (answers[q.id] === oi ? 'bg-navy-50 ring-navy-300' : 'bg-white ring-navy-100 hover:bg-navy-50')}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {q.type === 'gap' && (
                    <input disabled={submitted} value={answers[q.id] || ''} onChange={(e) => setAns(q.id, e.target.value)}
                      placeholder="พิมพ์คำตอบ (1 คำ)"
                      className="mt-2 w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm outline-none focus:border-ember-400" />
                  )}

                  {submitted && (
                    <p className={'mt-2 text-xs ' + (isCorrect(q) ? 'text-emerald-700' : 'text-rose-600')}>
                      เฉลย: <strong>{q.type === 'mc' ? q.options[q.answer] : Array.isArray(q.answer) ? q.answer.join(' / ') : q.answer}</strong> — {q.why}
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
              <p className="font-display text-4xl font-bold text-ember-500">{score}/{passage.questions.length}</p>
              <button onClick={() => pick(passage.id)} className="btn-ghost mt-3 px-5 py-1.5 text-xs">ทำใหม่</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
