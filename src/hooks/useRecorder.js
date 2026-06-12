import { useRef, useState, useCallback } from 'react'

// Pick a recording format the current device actually supports.
// iOS/Safari does NOT support webm — it records audio/mp4. Chrome uses webm/opus.
function pickMimeType() {
  if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) return ''
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/mp4;codecs=mp4a.40.2']
  for (const t of candidates) if (MediaRecorder.isTypeSupported(t)) return t
  return ''
}

// Microphone recorder using MediaRecorder. Exposes a blob URL for playback and
// the raw Blob (sent to the AI for pronunciation checking). The blob is tagged
// with the recorder's ACTUAL mime type so playback + decoding work everywhere.
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
      const mime = pickMimeType()
      const mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = (e) => e.data && e.data.size && chunksRef.current.push(e.data)
      mr.onstop = () => {
        const type = mr.mimeType || (chunksRef.current[0] && chunksRef.current[0].type) || 'audio/webm'
        const b = new Blob(chunksRef.current, { type })
        setBlob(b)
        setAudioUrl(URL.createObjectURL(b))
        stream.getTracks().forEach((t) => t.stop())
      }
      // timeslice keeps data flushing so nothing is lost on mobile Safari
      mr.start(1000)
      mediaRef.current = mr
      setRecording(true)
    } catch (e) {
      setError('ไม่สามารถเข้าถึงไมโครโฟนได้ — โปรดอนุญาตการใช้ไมค์ในเบราว์เซอร์')
    }
  }, [])

  const stop = useCallback(() => {
    try { mediaRef.current && mediaRef.current.state !== 'inactive' && mediaRef.current.stop() } catch { /* noop */ }
    setRecording(false)
  }, [])

  const clear = useCallback(() => {
    setAudioUrl(null)
    setBlob(null)
    chunksRef.current = []
  }, [])

  return { recording, audioUrl, blob, error, start, stop, clear, supported: typeof MediaRecorder !== 'undefined' }
}
