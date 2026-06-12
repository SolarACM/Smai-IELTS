import { useState } from 'react'
import { bandColor } from '../data/bands.js'
import { translateResult } from '../lib/ai.js'

// Renders a grading result (online/offline). Supports a Thai translation toggle
// for the explanatory feedback, and shows pronunciation details when present.
export default function BandPanel({ result }) {
  const [lang, setLang] = useState('en')
  const [th, setTh] = useState(null)
  const [translating, setTranslating] = useState(false)
  const [transErr, setTransErr] = useState(null)
  if (!result) return null
  const online = !result.offline

  const toTh = async () => {
    if (th) { setLang('th'); return }
    setTranslating(true)
    setTransErr(null)
    try {
      const t = await translateResult(result)
      if (t) { setTh(t); setLang('th') }
      else setTransErr('แปลไม่สำเร็จ ลองใหม่อีกครั้ง')
    } catch (e) {
      setTransErr(String(e.message || e))
    } finally {
      setTranslating(false)
    }
  }

  // merged view depending on language
  const v = lang === 'th' && th ? th : result
  const criteria = (result.criteria || []).map((c, i) => ({
    name: c.name,
    band: c.band,
    comment: lang === 'th' && th?.criteria?.[i]?.comment ? th.criteria[i].comment : c.comment,
  }))
  const strengths = lang === 'th' && th?.strengths ? th.strengths : result.strengths
  const improvements = lang === 'th' && th?.improvements ? th.improvements : result.improvements
  const summary = lang === 'th' && th?.summary ? th.summary : result.summary
  const mispron = (result.mispronounced || []).map((m, i) => ({
    word: m.word,
    issue: lang === 'th' && th?.mispronounced?.[i]?.issue ? th.mispronounced[i].issue : m.issue,
    tip: lang === 'th' && th?.mispronounced?.[i]?.tip ? th.mispronounced[i].tip : m.tip,
  }))

  return (
    <div className="card mt-6 overflow-hidden">
      <div className="flex items-center justify-between border-b border-navy-100 bg-navy-50/60 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-navy-500">
            ผลประเมิน {online ? '· โดย AI examiner' : '· โหมดออฟไลน์'}
          </p>
          <h3 className="mt-0.5 text-lg">
            {online && result.overall != null ? (
              <span className={bandColor(result.overall)}>Overall Band {result.overall}</span>
            ) : (
              <span className="text-navy-600">ประเมินตัวเอง</span>
            )}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {online && (
            <div className="flex rounded-full bg-white p-0.5 ring-1 ring-navy-100">
              <button
                onClick={() => setLang('en')}
                className={'rounded-full px-3 py-1 text-xs font-semibold ' + (lang === 'en' ? 'bg-ink text-white' : 'text-navy-500')}
              >
                EN
              </button>
              <button
                onClick={toTh}
                disabled={translating}
                className={'rounded-full px-3 py-1 text-xs font-semibold ' + (lang === 'th' ? 'bg-ink text-white' : 'text-navy-500')}
              >
                {translating ? '...' : 'ไทย'}
              </button>
            </div>
          )}
          {online && result.overall != null && (
            <div className={'grid h-14 w-14 place-items-center rounded-full ring-4 ring-navy-100 ' + bandColor(result.overall)}>
              <span className="font-display text-xl font-bold">{result.overall}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-5">
        {transErr && <p className="mb-3 rounded-lg bg-rose-50 p-2 text-xs text-rose-600">{transErr}</p>}

        {result.transcript && (
          <div className="mb-4 rounded-lg bg-parchment p-3 ring-1 ring-navy-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-navy-400">สิ่งที่ AI ได้ยินคุณพูด</p>
            <p className="mt-1 text-sm italic text-navy-600">“{result.transcript}”</p>
          </div>
        )}

        {online && criteria.some((c) => c.band != null) && (
          <div className="grid gap-3 sm:grid-cols-2">
            {criteria.map((c) => (
              <div key={c.name} className="rounded-xl bg-parchment p-3.5 ring-1 ring-navy-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-navy-700">{c.name}</span>
                  <span className={'font-display text-lg font-bold ' + bandColor(c.band)}>{c.band}</span>
                </div>
                {c.comment && <p className="mt-1 text-xs leading-relaxed text-navy-500">{c.comment}</p>}
              </div>
            ))}
          </div>
        )}

        {Array.isArray(result.checklist) && result.checklist.length > 0 && (
          <ul className="space-y-1.5">
            {result.checklist.map((c, i) => (
              <li key={i} className="flex gap-2 text-sm text-navy-600"><span className="text-ember-500">•</span><span>{c}</span></li>
            ))}
          </ul>
        )}

        {mispron.length > 0 && (
          <div className="mt-5">
            <h4 className="text-sm font-semibold text-navy-700">🔊 คำที่ออกเสียงควรปรับ</h4>
            <div className="mt-2 space-y-2">
              {mispron.map((m, i) => (
                <div key={i} className="rounded-lg bg-parchment p-3 text-sm ring-1 ring-navy-100">
                  <span className="font-semibold text-ink">{m.word}</span>
                  {m.issue && <span className="text-navy-500"> — {m.issue}</span>}
                  {m.tip && <p className="mt-0.5 text-xs text-emerald-700">💡 {m.tip}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {Array.isArray(strengths) && strengths.length > 0 && <Section title="จุดแข็ง" items={strengths} tone="emerald" />}
        {Array.isArray(improvements) && improvements.length > 0 && <Section title="ควรพัฒนา" items={improvements} tone="ember" />}

        {Array.isArray(result.corrected_examples) && result.corrected_examples.length > 0 && (
          <div className="mt-5">
            <h4 className="text-sm font-semibold text-navy-700">ตัวอย่างการแก้ประโยค</h4>
            <div className="mt-2 space-y-2">
              {result.corrected_examples.map((ex, i) => (
                <div key={i} className="rounded-lg bg-parchment p-3 text-sm ring-1 ring-navy-100">
                  <p className="text-rose-500 line-through decoration-rose-300">{ex.original}</p>
                  <p className="mt-1 text-emerald-700">{ex.better}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.model_answer && (
          <div className="mt-5">
            <h4 className="text-sm font-semibold text-navy-700">Model answer (Band 8+)</h4>
            <p className="mt-2 whitespace-pre-line rounded-lg bg-ink/95 p-4 text-sm leading-relaxed text-parchment">{result.model_answer}</p>
          </div>
        )}

        {summary && <p className="mt-5 rounded-lg bg-ember-50 p-3.5 text-sm leading-relaxed text-ember-800">{summary}</p>}
      </div>
    </div>
  )
}

function Section({ title, items, tone }) {
  const dot = tone === 'emerald' ? 'text-emerald-500' : 'text-ember-500'
  return (
    <div className="mt-5">
      <h4 className="text-sm font-semibold text-navy-700">{title}</h4>
      <ul className="mt-2 space-y-1.5">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2 text-sm text-navy-600"><span className={dot}>▸</span><span>{it}</span></li>
        ))}
      </ul>
    </div>
  )
}
