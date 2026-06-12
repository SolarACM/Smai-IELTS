import { useState, useEffect } from 'react'
import { getSettings, saveSettings } from '../lib/store.js'

const PROVIDERS = [
  { id: 'gemini', label: 'Gemini', ph: 'AIza...' },
  { id: 'openai', label: 'OpenAI', ph: 'sk-...' },
  { id: 'anthropic', label: 'Anthropic', ph: 'sk-ant-...' },
]

export default function SettingsModal({ open, onClose }) {
  const [s, setS] = useState(getSettings())

  useEffect(() => {
    if (open) setS(getSettings())
  }, [open])

  if (!open) return null
  const set = (k, v) => setS((prev) => ({ ...prev, [k]: v }))
  const handleSave = () => {
    saveSettings(s)
    onClose()
  }
  const current = PROVIDERS.find((p) => p.id === s.provider) || PROVIDERS[0]

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4" onClick={onClose}>
      <div className="card w-full max-w-lg p-6 sm:p-7" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl">ตั้งค่า AI (ขั้นสูง)</h3>
            <p className="mt-1 text-sm text-navy-500">
              ปกติเว็บมี <strong>ติวเตอร์ AI ในตัว</strong> อยู่แล้ว ไม่ต้องตั้งอะไร — ส่วนนี้สำหรับคนที่อยากใช้
              API key ของตัวเอง ข้อมูลถูกเก็บในเบราว์เซอร์ของคุณเท่านั้น
            </p>
          </div>
          <button onClick={onClose} className="text-navy-400 hover:text-ink">✕</button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-navy-500">ผู้ให้บริการ</label>
            <div className="mt-1.5 flex gap-2">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => set('provider', p.id)}
                  className={
                    'flex-1 rounded-lg px-3 py-2 text-sm font-semibold ring-1 transition ' +
                    (s.provider === p.id
                      ? 'bg-ink text-white ring-ink'
                      : 'bg-white text-navy-600 ring-navy-100 hover:bg-navy-50')
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-navy-500">API Key (ของคุณเอง)</label>
            <input
              type="password"
              value={s.apiKey}
              onChange={(e) => set('apiKey', e.target.value)}
              placeholder={current.ph}
              className="mt-1.5 w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm outline-none focus:border-ember-400"
            />
            <p className="mt-1 text-xs text-navy-400">เว้นว่างไว้ = ใช้ติวเตอร์ AI ในตัวของเว็บ</p>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-navy-500">โมเดล (ไม่ระบุก็ได้)</label>
            <input
              value={s.model}
              onChange={(e) => set('model', e.target.value)}
              placeholder={s.provider === 'gemini' ? 'gemini-2.0-flash' : s.provider === 'anthropic' ? 'claude-3-5-sonnet-latest' : 'gpt-4o-mini'}
              className="mt-1.5 w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm outline-none focus:border-ember-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-navy-500">
              เป้าหมาย Band: <span className="text-ember-500">{s.targetBand}</span>
            </label>
            <input
              type="range" min="5" max="9" step="0.5"
              value={s.targetBand}
              onChange={(e) => set('targetBand', parseFloat(e.target.value))}
              className="mt-1.5 w-full accent-ember-500"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button onClick={handleSave} className="btn-primary shrink-0">บันทึก</button>
        </div>
      </div>
    </div>
  )
}
