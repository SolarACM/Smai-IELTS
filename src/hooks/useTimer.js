import { useEffect, useRef, useState, useCallback } from 'react'

// Countdown timer. Calls onDone when it reaches 0.
export function useTimer(seconds, onDone) {
  const [remaining, setRemaining] = useState(seconds)
  const [running, setRunning] = useState(false)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    if (!running) return
    if (remaining <= 0) {
      setRunning(false)
      doneRef.current?.()
      return
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(id)
  }, [running, remaining])

  const start = useCallback(() => setRunning(true), [])
  const pause = useCallback(() => setRunning(false), [])
  const reset = useCallback(
    (s = seconds) => {
      setRunning(false)
      setRemaining(s)
    },
    [seconds],
  )

  return { remaining, running, start, pause, reset, setRemaining }
}

export function fmt(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}
