// Convert a recorded audio Blob (webm/opus from MediaRecorder) into a
// 16 kHz mono 16-bit WAV, base64-encoded — a format Gemini can listen to.
// Caps duration to keep the payload under Vercel's request-size limit.
export async function blobToWavBase64(blob, { rate = 16000, maxSeconds = 90 } = {}) {
  const arrayBuf = await blob.arrayBuffer()
  const AC = window.AudioContext || window.webkitAudioContext
  const ctx = new AC()
  const audioBuf = await ctx.decodeAudioData(arrayBuf)
  if (ctx.close) ctx.close()

  const chCount = audioBuf.numberOfChannels
  const srcRate = audioBuf.sampleRate
  const srcLen = audioBuf.length

  // downmix to mono
  const mono = new Float32Array(srcLen)
  for (let c = 0; c < chCount; c++) {
    const d = audioBuf.getChannelData(c)
    for (let i = 0; i < srcLen; i++) mono[i] += d[i] / chCount
  }

  // linear resample to target rate, capped at maxSeconds
  const ratio = rate / srcRate
  let outLen = Math.floor(srcLen * ratio)
  const maxLen = rate * maxSeconds
  if (outLen > maxLen) outLen = maxLen
  const out = new Float32Array(outLen)
  for (let i = 0; i < outLen; i++) {
    const srcPos = i / ratio
    const i0 = Math.floor(srcPos)
    const i1 = Math.min(i0 + 1, srcLen - 1)
    const f = srcPos - i0
    out[i] = mono[i0] * (1 - f) + mono[i1] * f
  }

  // encode 16-bit PCM WAV
  const buffer = new ArrayBuffer(44 + outLen * 2)
  const view = new DataView(buffer)
  const writeStr = (o, s) => { for (let i = 0; i < s.length; i++) view.setUint8(o + i, s.charCodeAt(i)) }
  writeStr(0, 'RIFF'); view.setUint32(4, 36 + outLen * 2, true); writeStr(8, 'WAVE')
  writeStr(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true)
  view.setUint32(24, rate, true); view.setUint32(28, rate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true)
  writeStr(36, 'data'); view.setUint32(40, outLen * 2, true)
  let off = 44
  for (let i = 0; i < outLen; i++) {
    const s = Math.max(-1, Math.min(1, out[i]))
    view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true)
    off += 2
  }

  // base64
  const bytes = new Uint8Array(buffer)
  let bin = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk))
  return btoa(bin)
}
