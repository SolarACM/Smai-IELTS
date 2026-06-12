import { useState, useEffect } from 'react'
import { getSettings, saveSettings } from '../lib/store.js'

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

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4" onClick={onClose}>
      <div
        className="card w-full max-w-lg p-6 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl">ตั้งค่าผู้ช่วย AI</h3>
            <p className="mt-1 text-sm text-navy-500">
              เชื่อม API เพื่อให้ AI ตรวจ essay และซ้อมพูดให้คะแนน band อัตโนมัติ — ข้อมูลถูกเก็บไว้ในเบราว์เซอร์ของคุณเท่านั้น
            </p>
          </div>
          <button onClick={onClose} className="text-navy-400 hover:text-ink">✕</button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-navy-500">ผู้ให้บริการ</label>
            <div className="mt-1.5 flex gap-2">
              {['openai', 'anthropic'].map((p) => (
                <button
                  key={p}
                  onClick={() => set('provider', p)}
                  className={
                    'flex-1 rounded-lg px-3 py-2 text-sm font-semibold ring-1 transition ' +
                    (s.provider === p
                      ? 'bg-ink text-white ring-ink'
                      : 'bg-white text-navy-600 ring-navy-100 hover:bg-navy-50')
                  }
                >
                  {p === 'openai' ? 'OpenAI' : 'Anthropic'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-navy-500">API Key</label>
            <input
              type="password"
              value={s.apiKey}
              onChange={(e) => set('apiKey', e.target.value)}
              placeholder={s.provider === 'anthropic' ? 'sk-ant-...' : 'sk-...'}
              className="mt-1.5 w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm outline-none focus:border-ember-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-navy-500">
              โมเดล (ไม่ระบุก็ได้)
            </label>
            <input
              value={s.model}
              onChange={(e) => set('model', e.target.value)}
              placeholder={s.provider === 'anthropic' ? 'claude-sonnet-4-5' : 'gpt-4o-mini'}
              className="mt-1.5 w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm outline-none focus:border-ember-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-navy-500">
              เป้าหมาย Band: <span className="text-ember-500">{s.targetBand}</span>
            </label>
            <input
              type="range"
              min="5"
              max="9"
              step="0.5"
              value={s.targetBand}
              onChange={(e) => set('targetBand', parseFloat(e.target.value))}
              className="mt-1.5 w-full accent-ember-500"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-xs text-navy-400">
            ไม่เชื่อม AI ก็ใช้งานได้ — จะเป็นโหมดออฟไลน์ (timer + model answer + band descriptor)
          </p>
          <button onClick={handleSave} className="btn-primary shrink-0">บันทึก</button>
        </div>
      </div>
    </div>
  )
}
