import { useMemo, useState } from 'react'
import { speakingSets } from '../data/speaking.js'
import { speakingBands } from '../data/bands.js'
import { useTimer, fmt } from '../hooks/useTimer.js'
import { useRecorder } from '../hooks/useRecorder.js'
import { gradeSpeaking, aiEnabled } from '../lib/ai.js'
import { logAttempt } from '../lib/store.js'
import BandPanel from '../components/BandPanel.jsx'
import BandDescriptors from '../components/BandDescriptors.jsx'

export default function Speaking() {
  const [setId, setSetId] = useState(speakingSets[0].id)
  const [part, setPart] = useState(1)
  const set = useMemo(() => speakingSets.find((s) => s.id === setId), [setId])

  const pickSet = (id) => {
    setSetId(id)
    setPart(1)
  }

  return (
    <div className="container-app py-10">
      <header>
        <span className="chip bg-ember-50 text-ember-700">Speaking</span>
        <h1 className="mt-3 text-4xl">ห้องสอบพูดจำลอง</h1>
        <p className="mt-2 max-w-2xl text-navy-500">
          ครบทั้ง 3 พาร์ตเหมือนสอบจริง จับเวลา อัดเสียงตัวเอง แล้วให้ AI เป็นกรรมการให้ band — หรือฟังเทียบ model answer เอง
        </p>
      </header>

      {/* set picker */}
      <div className="mt-6 flex flex-wrap gap-2">
        {speakingSets.map((s) => (
          <button
            key={s.id}
            onClick={() => pickSet(s.id)}
            className={
              'rounded-full px-4 py-2 text-sm font-semibold ring-1 transition ' +
              (s.id === setId
                ? 'bg-ink text-white ring-ink'
                : 'bg-white text-navy-600 ring-navy-100 hover:bg-navy-50')
            }
          >
            {s.topic}
          </button>
        ))}
      </div>

      {/* part tabs */}
      <div className="mt-5 flex gap-1 rounded-full bg-navy-50 p-1">
        {[1, 2, 3].map((p) => (
          <button
            key={p}
            onClick={() => setPart(p)}
            className={
              'flex-1 rounded-full px-3 py-2 text-sm font-semibold transition ' +
              (part === p ? 'bg-white text-ink shadow-card' : 'text-navy-500')
            }
          >
            Part {p}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <div>
          {part === 1 && <InterviewPart key={set.id + '1'} data={set.part1} partNo={1} />}
          {part === 2 && <CueCardPart key={set.id + '2'} data={set.part2} model={set.modelPart2} />}
          {part === 3 && <InterviewPart key={set.id + '3'} data={set.part3} partNo={3} />}
        </div>
        <div>
          <BandDescriptors data={speakingBands} title="Speaking band descriptor" />
          <div className="card mt-6 p-5 text-sm leading-relaxed text-navy-500">
            <h4 className="font-semibold text-navy-700">เคล็ดลับใช้ห้องนี้</h4>
            <ul className="mt-2 space-y-1.5">
              <li>• กดอัดเสียงแล้วพูดจริง อย่าอ่านสคริปต์</li>
              <li>• ฟังเสียงตัวเองซ้ำ จับ filler และการหยุด</li>
              <li>• พิมพ์/วาง transcript สิ่งที่พูด แล้วให้ AI ให้ band</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---- Part 1 & 3: interview-style questions ---- */
function InterviewPart({ data, partNo }) {
  const [idx, setIdx] = useState(0)
  const rec = useRecorder()
  const [transcript, setTranscript] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const q = data.questions[idx]

  const move = (d) => {
    setIdx((i) => Math.min(Math.max(i + d, 0), data.questions.length - 1))
    setResult(null)
    setError(null)
    setTranscript('')
    rec.clear()
  }

  const grade = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const r = await gradeSpeaking({ part: partNo, question: q, transcript })
      setResult(r)
      logAttempt({ skill: 'speaking', part: partNo, band: r.overall ?? null })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="card p-5">
        <div className="flex items-center justify-between text-xs font-semibold text-navy-400">
          <span>{data.label}</span>
          <span>{data.durationNote}</span>
        </div>
        <p className="mt-3 text-xl leading-relaxed text-ink">{q}</p>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs text-navy-400">
            คำถาม {idx + 1}/{data.questions.length}
          </span>
          <div className="flex gap-2">
            <button onClick={() => move(-1)} disabled={idx === 0} className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-40">← ก่อนหน้า</button>
            <button onClick={() => move(1)} disabled={idx === data.questions.length - 1} className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-40">ถัดไป →</button>
          </div>
        </div>
      </div>

      <Recorder rec={rec} />
      <TranscriptBox value={transcript} onChange={setTranscript} onGrade={grade} loading={loading} />
      {error && <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-600">{error}</p>}
      {result && <BandPanel result={result} />}
    </div>
  )
}

/* ---- Part 2: cue card with prep + talk timers ---- */
function CueCardPart({ data, model }) {
  const [phase, setPhase] = useState('idle') // idle | prep | talk | done
  const rec = useRecorder()
  const [transcript, setTranscript] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showModel, setShowModel] = useState(false)

  const talkTimer = useTimer(data.talk, () => {
    rec.stop()
    setPhase('done')
  })
  const prepTimer = useTimer(data.prep, () => beginTalk())

  const beginPrep = () => {
    setPhase('prep')
    prepTimer.reset(data.prep)
    prepTimer.start()
  }
  const beginTalk = async () => {
    setPhase('talk')
    talkTimer.reset(data.talk)
    talkTimer.start()
    await rec.start()
  }
  const stopTalk = () => {
    talkTimer.pause()
    rec.stop()
    setPhase('done')
  }
  const restart = () => {
    setPhase('idle')
    setResult(null)
    setError(null)
    setTranscript('')
    rec.clear()
    prepTimer.reset(data.prep)
    talkTimer.reset(data.talk)
  }

  const grade = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const r = await gradeSpeaking({ part: 2, question: data.cue, transcript })
      setResult(r)
      logAttempt({ skill: 'speaking', part: 2, band: r.overall ?? null })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="card overflow-hidden">
        <div className="border-b border-navy-100 bg-navy-50/60 px-5 py-3 text-xs font-semibold text-navy-400">
          {data.label} · เตรียม 1 นาที · พูด 2 นาที
        </div>
        <div className="p-5">
          <p className="text-xl leading-relaxed text-ink">{data.cue}</p>
          <p className="mt-3 text-sm font-semibold text-navy-500">You should say:</p>
          <ul className="mt-1.5 space-y-1">
            {data.bullets.map((b, i) => (
              <li key={i} className="flex gap-2 text-sm text-navy-600">
                <span className="text-ember-500">•</span>
                <span>{b}</span>
              </li>
            ))}
          </ul>

          {/* phase controls */}
          <div className="mt-6 rounded-xl bg-parchment p-4 ring-1 ring-navy-100">
            {phase === 'idle' && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-navy-500">พร้อมแล้วกดเริ่ม — จะให้เวลาเตรียม 1 นาที</span>
                <button onClick={beginPrep} className="btn-primary px-5 py-2 text-xs">▶ เริ่ม</button>
              </div>
            )}
            {phase === 'prep' && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-ember-600">กำลังเตรียมตัว · จดโน้ตได้</p>
                  <p className="font-display text-3xl font-bold tabular-nums text-ink">{fmt(prepTimer.remaining)}</p>
                </div>
                <button onClick={beginTalk} className="btn-dark px-5 py-2 text-xs">ข้ามไปพูดเลย →</button>
              </div>
            )}
            {phase === 'talk' && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-rose-500">
                    <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-rose-500" /> กำลังพูด & อัดเสียง
                  </p>
                  <p className="font-display text-3xl font-bold tabular-nums text-ink">{fmt(talkTimer.remaining)}</p>
                </div>
                <button onClick={stopTalk} className="btn-ghost px-5 py-2 text-xs">■ หยุด</button>
              </div>
            )}
            {phase === 'done' && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-emerald-600">✓ เสร็จแล้ว — ฟังเสียงตัวเองด้านล่าง</span>
                <button onClick={restart} className="btn-ghost px-5 py-2 text-xs">↻ ทำใหม่</button>
              </div>
            )}
          </div>

          {rec.error && <p className="mt-3 text-sm text-rose-600">{rec.error}</p>}
          {rec.audioUrl && (
            <audio controls src={rec.audioUrl} className="mt-4 w-full" />
          )}
        </div>
      </div>

      <TranscriptBox value={transcript} onChange={setTranscript} onGrade={grade} loading={loading} />
      <div className="mt-3">
        <button onClick={() => setShowModel((s) => !s)} className="btn-ghost px-4 py-1.5 text-xs">
          {showModel ? 'ซ่อน model answer' : 'ดู model answer (Band 8+)'}
        </button>
      </div>
      {showModel && (
        <p className="mt-3 whitespace-pre-line rounded-lg bg-ink/95 p-4 text-sm leading-relaxed text-parchment">{model}</p>
      )}
      {error && <p className="mt-3 rounded-lg bg-rose-50 p-3 text-sm text-rose-600">{error}</p>}
      {result && <BandPanel result={result} />}
    </div>
  )
}

/* ---- shared sub-components ---- */
function Recorder({ rec }) {
  return (
    <div className="card mt-4 flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        {!rec.recording ? (
          <button onClick={rec.start} className="btn-primary px-5 py-2 text-xs">🎙 อัดเสียง</button>
        ) : (
          <button onClick={rec.stop} className="btn-ghost px-5 py-2 text-xs">
            <span className="mr-1 inline-block h-2 w-2 animate-pulse rounded-full bg-rose-500" /> หยุด
          </button>
        )}
        {rec.audioUrl && <span className="text-xs text-emerald-600">มีไฟล์เสียงแล้ว</span>}
      </div>
      {rec.audioUrl && <audio controls src={rec.audioUrl} className="h-8 max-w-[55%]" />}
    </div>
  )
}

function TranscriptBox({ value, onChange, onGrade, loading }) {
  return (
    <div className="card mt-4 p-4">
      <label className="text-xs font-semibold uppercase tracking-wide text-navy-500">
        Transcript — พิมพ์/วางสิ่งที่คุณพูด เพื่อให้ AI ให้ band
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="พิมพ์สิ่งที่คุณพูด หรือฟังเสียงแล้วถอดความที่นี่..."
        className="mt-2 h-28 w-full resize-y rounded-lg border border-navy-100 bg-white p-3 text-sm outline-none focus:border-ember-400"
      />
      <div className="mt-2 flex justify-end">
        <button
          onClick={onGrade}
          disabled={loading || value.trim().length < 10}
          className="btn-primary px-5 py-1.5 text-xs disabled:opacity-40"
        >
          {loading ? 'กำลังตรวจ...' : aiEnabled() ? 'ให้ AI ให้ band' : 'ประเมิน (ออฟไลน์)'}
        </button>
      </div>
    </div>
  )
}
