import { useState } from 'react'

// Collapsible band descriptor reference (Writing or Speaking).
export default function BandDescriptors({ data, title = 'Band descriptor — ประเมินตัวเอง' }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card mt-6 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold text-navy-700">{title}</span>
        <span className="text-navy-400">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="space-y-4 border-t border-navy-100 p-5">
          {Object.entries(data).map(([criterion, bands]) => (
            <div key={criterion}>
              <h4 className="text-sm font-semibold text-ink">{criterion}</h4>
              <div className="mt-2 grid gap-1.5">
                {Object.entries(bands)
                  .sort((a, b) => b[0] - a[0])
                  .map(([band, desc]) => (
                    <div key={band} className="flex gap-3 text-sm">
                      <span className="w-12 shrink-0 font-display font-bold text-ember-500">
                        Band {band}
                      </span>
                      <span className="text-navy-600">{desc}</span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
