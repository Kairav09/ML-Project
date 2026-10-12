import { useEffect, useState } from 'react'
import Topnav from './components/Topnav.jsx'
import Landing from './pages/Landing.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Forecast from './pages/Forecast.jsx'
import Prediction from './pages/Prediction.jsx'
import LiveDemand from './pages/LiveDemand.jsx'
import Reports from './pages/Reports.jsx'
import Settings from './pages/Settings.jsx'
import { loadSession, clearSession, resolveName, renameSession } from './lib/profile.js'

export default function App() {
  const [session, setSession] = useState(() => loadSession())
  const [page, setPage] = useState('dashboard')
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('demand-ai-theme') || 'light' } catch { return 'light' }
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem('demand-ai-theme', theme) } catch { /* ignore */ }
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  const user = session?.name || ''

  const login = (name, email) => {
    // name from register is already remembered via profile; login re-resolves it
    setSession(resolveName({ email, givenName: '' }))
    setAuthOpen(false)
  }
  const logout = () => {
    clearSession()
    setSession(null)
    setPage('dashboard')
  }
  const onRename = (newName) => setSession(renameSession(session?.email, newName))
  const go = (p) => { setPage(p); window.scrollTo(0, 0) }
  const openAuth = (mode) => { setAuthMode(mode); setAuthOpen(true) }

  if (!user) {
    return (
      <Landing
        authOpen={authOpen}
        authMode={authMode}
        setAuthMode={setAuthMode}
        openAuth={openAuth}
        closeAuth={() => setAuthOpen(false)}
        onLogin={login}
      />
    )
  }

  return (
    <div className="app">
      <Topnav page={page} setPage={(p) => go(p)} session={session} onRename={onRename}
        onLogout={logout} theme={theme} onToggleTheme={toggleTheme} />
      <main className="main" key={page}>
        {page === 'dashboard' && <Dashboard session={session} go={go} />}
        {page === 'forecast' && <Forecast session={session} />}
        {page === 'prediction' && <Prediction session={session} />}
        {page === 'live' && <LiveDemand session={session} />}
        {page === 'reports' && <Reports session={session} />}
        {page === 'settings' && <Settings session={session} />}
      </main>
    </div>
  )
}
