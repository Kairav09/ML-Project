// Display-name logic: prefer an explicitly given name, then a remembered
// profile for the email, then a cleaned-up version of the email handle.
const SESSION_KEY = 'demand-ai-user'
const PROFILE_KEY = 'demand-ai-profiles'

/** "kairav.vashi198" -> "Kairav Vashi" · "kairavvashi198" -> "Kairavvashi" */
export function cleanHandle(email) {
  const local = String(email || '').split('@')[0]
  const stripped = local.replace(/[0-9._-]+$/, '').replace(/^[0-9._-]+/, '')
  const words = stripped.split(/[._-]+/).filter(Boolean)
  if (!words.length) return 'Planner'
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
}

export function getProfiles() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) || {} }
  catch { return {} }
}

export function saveProfile(email, name) {
  if (!email || !name) return
  try {
    const p = getProfiles()
    p[String(email).toLowerCase()] = name
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p))
  } catch { /* ignore */ }
}

export function profileName(email) {
  if (!email) return null
  return getProfiles()[String(email).toLowerCase()] || null
}

function saveSession(s) {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(s)) } catch { /* ignore */ }
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    if (raw.startsWith('{')) {
      const s = JSON.parse(raw)
      // auto-derived names get re-cleaned with the improved logic
      if (s && !s.explicit && s.email) return { ...s, name: cleanHandle(s.email) }
      return s
    }
    // legacy plain-string session: at minimum strip trailing digits
    const cleaned = raw.replace(/[0-9]+$/, '')
    return { name: cleaned || raw, email: '', explicit: false }
  } catch { return null }
}

export function clearSession() {
  try { localStorage.removeItem(SESSION_KEY) } catch { /* ignore */ }
}

/** Change the display name; remembers it for the email. Returns the new session. */
export function renameSession(email, newName) {
  const name = String(newName || '').trim()
  if (!name) return loadSession()
  saveProfile(email, name)
  const s = { name, email: email || '', explicit: true }
  saveSession(s)
  return s
}

/** Resolve the display name for an auth event. */
export function resolveName({ email, givenName }) {
  if (givenName && givenName.trim()) {
    const name = givenName.trim()
    saveProfile(email, name)
    const s = { name, email: email || '', explicit: true }
    saveSession(s)
    return s
  }
  const remembered = profileName(email)
  if (remembered) {
    const s = { name: remembered, email: email || '', explicit: true }
    saveSession(s)
    return s
  }
  const s = { name: cleanHandle(email), email: email || '', explicit: false }
  saveSession(s)
  return s
}
