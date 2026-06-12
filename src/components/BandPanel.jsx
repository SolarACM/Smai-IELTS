import { bandColor } from '../data/bands.js'

// Renders a grading result from lib/ai (online or offline shape).
export default function BandPanel({ result }) {
  if (!result) return null
  const online = !result.offline

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
        {online && result.overall != null && (
          <div className={'grid h-16 w-16 place-items-center rounded-full ring-4 ring-navy-100 ' + bandColor(result.overall)}>
            <span className="font-display text-2xl font-bold">{result.overall}</span>
          </div>
        )}
      </div>

      <div className="p-5">
        {online && Array.isArray(result.criteria) && result.criteria.some((c) => c.band != null) && (
          <div className="grid gap-3 sm:grid-cols-2">
            {result.criteria.map((c) => (
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
              <li key={i} className="flex gap-2 text-sm text-navy-600">
                <span className="text-ember-500">•</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        )}

        {Array.isArray(result.strengths) && result.strengths.length > 0 && (
          <Section title="จุดแข็ง" items={result.strengths} tone="emerald" />
        )}
        {Array.isArray(result.improvements) && result.improvements.length > 0 && (
          <Section title="ควรพัฒนา" items={result.improvements} tone="ember" />
        )}

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
            <p className="mt-2 whitespace-pre-line rounded-lg bg-ink/95 p-4 text-sm leading-relaxed text-parchment">
              {result.model_answer}
            </p>
          </div>
        )}

        {result.summary && (
          <p className="mt-5 rounded-lg bg-ember-50 p-3.5 text-sm leading-relaxed text-ember-800">
            {result.summary}
          </p>
        )}
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
          <li key={i} className="flex gap-2 text-sm text-navy-600">
            <span className={dot}>▸</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
