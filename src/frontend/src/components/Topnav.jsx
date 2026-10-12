import { useState } from 'react'
import Icon from './icons.jsx'
import ProfileMenu from './ProfileMenu.jsx'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'forecast', label: 'Forecast Planner', icon: 'forecast' },
  { id: 'prediction', label: 'Prediction', icon: 'sparkles' },
  { id: 'live', label: 'Live Demand', icon: 'activity' },
  { id: 'reports', label: 'Reports', icon: 'report' },
  { id: 'settings', label: 'Settings', icon: 'sliders' },
]

export default function Topnav({ page, setPage, session, onRename, onLogout, theme, onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const name = session?.name || 'Planner'

  return (
    <header className="topnav">
      <div className="tn-brand">
        <span className="mark"><Icon name="logo" size={20} /></span>
        <span>Demand AI</span>
      </div>
      <nav className="tn-links">
        {NAV.map((n) => (
          <button key={n.id} className={'tn-link' + (page === n.id ? ' active' : '')} onClick={() => setPage(n.id)}>
            <Icon name={n.icon} size={17} />
            <span>{n.label}</span>
          </button>
        ))}
      </nav>
      <div className="tn-actions">
        <button className="tn-iconbtn" onClick={onToggleTheme} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
        </button>
        <div style={{ position: 'relative' }}>
          <button className="avatar-btn" onClick={() => setMenuOpen((o) => !o)} aria-label="Profile">
            {name[0].toUpperCase()}
          </button>
          {menuOpen && (
            <ProfileMenu session={session} onRename={onRename} onLogout={onLogout} onClose={() => setMenuOpen(false)} />
          )}
        </div>
      </div>
    </header>
  )
}
