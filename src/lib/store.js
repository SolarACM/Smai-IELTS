// Tiny localStorage-backed store for settings & progress.
const NS = 'smai:'

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(NS + key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(NS + key, JSON.stringify(value))
  } catch {
    /* ignore quota / private mode */
  }
}

export function getSettings() {
  return load('settings', {
    provider: 'gemini', // 'gemini' | 'openai' | 'anthropic'
    apiKey: '',
    model: '',
    targetBand: 7,
  })
}

export function saveSettings(s) {
  save('settings', s)
}

// Simple attempt logging so a progress page / streaks can grow later.
export function logAttempt(entry) {
  const list = load('attempts', [])
  list.unshift({ ...entry, at: Date.now() })
  save('attempts', list.slice(0, 200))
}

export function getAttempts() {
  return load('attempts', [])
}
