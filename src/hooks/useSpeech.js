import { useEffect, useRef, useState, useCallback } from 'react'

// Text-to-speech via the browser Web Speech API.
// On Chrome this uses Google's voices (e.g. "Google US English") — the same
// natural native-speaker voices as Google Translate.
export function useSpeech() {
  const [voices, setVoices] = useState([])
  const [speaking, setSpeaking] = useState(false)
  const [paused, setPaused] = useState(false)
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const utterRef = useRef(null)

  useEffect(() => {
    if (!supported) return
    const load = () => setVoices(window.speechSynthesis.getVoices())
    load()
    window.speechSynthesis.onvoiceschanged = load
    return () => {
      window.speechSynthesis.onvoiceschanged = null
      window.speechSynthesis.cancel()
    }
  }, [supported])

  const pickVoice = useCallback(
    (lang) => {
      const matches = voices.filter((v) => v.lang && v.lang.toLowerCase().startsWith(lang.toLowerCase()))
      // prefer Google / Natural voices for the most natural accent
      return (
        matches.find((v) => /google/i.test(v.name)) ||
        matches.find((v) => /natural|microsoft/i.test(v.name)) ||
        matches[0] ||
        null
      )
    },
    [voices],
  )

  const speak = useCallback(
    (text, { lang = 'en-US', rate = 1 } = {}) => {
      if (!supported) return
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = lang
      u.rate = rate
      const v = pickVoice(lang)
      if (v) u.voice = v
      u.onend = () => { setSpeaking(false); setPaused(false) }
      u.onerror = () => { setSpeaking(false); setPaused(false) }
      utterRef.current = u
      setSpeaking(true)
      setPaused(false)
      window.speechSynthesis.speak(u)
    },
    [supported, pickVoice],
  )

  const pause = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.pause()
    setPaused(true)
  }, [supported])

  const resume = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.resume()
    setPaused(false)
  }, [supported])

  const stop = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
    setSpeaking(false)
    setPaused(false)
  }, [supported])

  return { supported, voices, speaking, paused, speak, pause, resume, stop, pickVoice }
}
