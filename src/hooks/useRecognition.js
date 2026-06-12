import { useCallback, useRef, useState } from 'react'

// Live speech-to-text via the browser SpeechRecognition API (Chrome/Edge).
// As the user speaks, onUpdate receives the running transcript so we can
// auto-fill the answer box — no manual typing or self-transcribing needed.
export function useRecognition() {
  const SR = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null
  const [listening, setListening] = useState(false)
  const recRef = useRef(null)
  const finalRef = useRef('')
  const cbRef = useRef(null)

  const start = useCallback(
    (lang = 'en-US', onUpdate) => {
      if (!SR) return
      const rec = new SR()
      rec.lang = lang
      rec.continuous = true
      rec.interimResults = true
      finalRef.current = ''
      cbRef.current = onUpdate
      rec.onresult = (e) => {
        let interim = ''
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript
          if (e.results[i].isFinal) finalRef.current += t + ' '
          else interim += t
        }
        cbRef.current && cbRef.current((finalRef.current + interim).replace(/\s+/g, ' ').trim())
      }
      rec.onend = () => setListening(false)
      rec.onerror = () => setListening(false)
      recRef.current = rec
      setListening(true)
      try { rec.start() } catch { setListening(false) }
    },
    [SR],
  )

  const stop = useCallback(() => {
    try { recRef.current && recRef.current.stop() } catch { /* noop */ }
    setListening(false)
  }, [])

  return { supported: !!SR, listening, start, stop }
}
