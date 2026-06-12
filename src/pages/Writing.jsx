import { useMemo, useState } from 'react'
import { writingTasks } from '../data/writing.js'
import { writingBands } from '../data/bands.js'
import { useTimer, fmt } from '../hooks/useTimer.js'
import { gradeEssay, aiEnabled } from '../lib/ai.js'
import { logAttempt } from '../lib/store.js'
import BandPanel from '../components/BandPanel.jsx'
import BandDescriptors from '../components/BandDescriptors.jsx'

export default function Writing() {
  const [taskId, setTaskId] = useState(writingTasks[0].id)
  const task = useMemo(() => writingTasks.find((t) => t.id === taskId), [taskId])
  const [essay, setEssay] = useState('')
  const [showModel, setShowModel] = useState(false)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const timer = useTimer(task.time * 60)
  const words = (essay.trim().match(/\S+/g) || []).length
  const enough = words >= task.minWords

  const pickTask = (id) => {
    setTaskId(id)
    setEssay('')
    setResult(null)
    setError(null)
    setShowModel(false)
    const t = writingTasks.find((x) => x.id === id)
    timer.reset(t.time * 60)
  }

  const handleGrade = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const r = await gradeEssay({ task: task.task, prompt: task.prompt, essay })
      setResult(r)
      logAttempt({ skill: 'writing', taskId: task.id, words, band: r.overall ?? null })
    } catch (e) {
      setError(e.message || 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-app py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="chip bg-ember-50 text-ember-700">Writing</span>
          <h1 className="mt-3 text-4xl">ฝึกเขียน + ตรวจให้คะแนน</h1>
          <p className="mt-2 max-w-2xl text-navy-500">
            เขียนภายใต้เวลาสอบจริง แล้วให้ AI ตรวจรายเกณฑ์ หรือเทียบกับ model answer เอง
          </p>
        </div>
        <div className="text-right">
          <div className="font-display text-3xl font-bold tabular-nums text-ink">{fmt(timer.remaining)}</div>
          <div className="mt-1 flex gap-2">
            {!timer.running ? (
              <button onClick={timer.start} className="btn-dark px-4 py-1.5 text-xs">▶ จับเวลา</button>
            ) : (
              <button onClick={timer.pause} className="btn-ghost px-4 py-1.5 text-xs">⏸ พัก</button>
            )}
            <button onClick={() => timer.reset(task.time * 60)} className="btn-ghost px-4 py-1.5 text-xs">รีเซ็ต</button>
          </div>
        </div>
      </header>

      {/* task picker */}
      <div className="mt-6 flex flex-wrap gap-2">
        {writingTasks.map((t) => (
          <button
            key={t.id}
            onClick={() => pickTask(t.id)}
            className={
              'rounded-full px-4 py-2 text-sm font-semibold ring-1 transition ' +
              (t.id === taskId
                ? 'bg-ink text-white ring-ink'
                : 'bg-white text-navy-600 ring-navy-100 hover:bg-navy-50')
            }
          >
            {t.task} · {t.type}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        {/* left: prompt + editor */}
        <div>
          <div className="card p-5">
            <div className="flex items-center justify-between text-xs font-semibold text-navy-400">
              <span>{task.task} · {task.type}</span>
              <span>ขั้นต่ำ {task.minWords} คำ · {task.time} นาที</span>
            </div>
            <p className="mt-3 leading-relaxed text-ink">{task.prompt}</p>
          </div>

          <textarea
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            placeholder="เริ่มเขียนที่นี่..."
            className="mt-4 h-80 w-full resize-y rounded-xl2 border border-navy-100 bg-white p-4 text-sm leading-relaxed outline-none focus:border-ember-400"
          />

          <div className="mt-2 flex items-center justify-between text-sm">
            <span className={enough ? 'text-emerald-600' : 'text-navy-400'}>
              {words} คำ {enough ? '✓' : `/ ${task.minWords}`}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setShowModel((s) => !s)}
                className="btn-ghost px-4 py-1.5 text-xs"
              >
                {showModel ? 'ซ่อน model answer' : 'ดู model answer'}
              </button>
              <button
                onClick={handleGrade}
                disabled={loading || words < 20}
                className="btn-primary px-5 py-1.5 text-xs disabled:opacity-40"
              >
                {loading ? 'กำลังตรวจ...' : aiEnabled() ? 'ให้ AI ตรวจ' : 'ประเมิน (ออฟไลน์)'}
              </button>
            </div>
          </div>

          {error && (
            <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-600">{error}</p>
          )}

          {result && <BandPanel result={result} />}

          {showModel && (
            <div className="card mt-4 p-5">
              <h4 className="text-sm font-semibold text-navy-700">Model answer</h4>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-navy-600">{task.model}</p>
            </div>
          )}
        </div>

        {/* right: plan + descriptors */}
        <div>
          <div className="card p-5">
            <h4 className="text-sm font-semibold text-navy-700">โครงที่แนะนำ</h4>
            <ol className="mt-3 space-y-2">
              {task.plan.map((p, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-navy-600">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-navy-50 text-xs font-bold text-navy-500">
                    {i + 1}
                  </span>
                  <span>{p}</span>
                </li>
              ))}
            </ol>
          </div>
          <BandDescriptors data={writingBands} />
        </div>
      </div>
    </div>
  )
}
