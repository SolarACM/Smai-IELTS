import { useRef, useState, useCallback } from 'react'

// Microphone recorder using MediaRecorder. Exposes a blob URL for playback
// and the raw Blob (so we can send the audio to the AI for pronunciation check).
export function useRecorder() {
  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const [blob, setBlob] = useState(null)
  const [error, setError] = useState(null)
  const mediaRef = useRef(null)
  const chunksRef = useRef([])

  const start = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data)
      mr.onstop = () => {
        const b = new Blob(chunksRef.current, { type: 'audio/webm' })
        setBlob(b)
        setAudioUrl(URL.createObjectURL(b))
        stream.getTracks().forEach((t) => t.stop())
      }
      mr.start()
      mediaRef.current = mr
      setRecording(true)
    } catch (e) {
      setError('ไม่สามารถเข้าถึงไมโครโฟนได้ — โปรดอนุญาตการใช้ไมค์ในเบราว์เซอร์')
    }
  }, [])

  const stop = useCallback(() => {
    mediaRef.current?.stop()
    setRecording(false)
  }, [])

  const clear = useCallback(() => {
    setAudioUrl(null)
    setBlob(null)
    chunksRef.current = []
  }, [])

  return { recording, audioUrl, blob, error, start, stop, clear, supported: typeof MediaRecorder !== 'undefined' }
}
