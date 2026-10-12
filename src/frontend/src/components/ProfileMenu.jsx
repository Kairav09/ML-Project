import { useEffect, useState } from 'react'
import Icon from './icons.jsx'

/** Account dropdown: profile header, rename, sign out. Closes on veil/Escape. */
export default function ProfileMenu({ session, onRename, onLogout, onClose }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const name = session?.name || 'Planner'
  const email = session?.email || ''

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose])

  const startEdit = () => { setDraft(name); setEditing(true) }
  const saveEdit = () => {
    if (draft.trim()) onRename(draft.trim())
    setEditing(false)
    onClose()
  }

  return (
    <>
      <div className="menu-veil" onClick={onClose} />
      <div className="profile-menu">
        <div className="pm-head">
          <div className="pm-avatar">{name[0].toUpperCase()}</div>
          <div style={{ minWidth: 0 }}>
            <div className="pm-name">{name}</div>
            {email && <div className="pm-email">{email}</div>}
          </div>
        </div>
        {editing ? (
          <div className="pm-edit">
            <label>Display name</label>
            <input value={draft} onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveEdit()} autoFocus maxLength={40} />
            <div className="pm-edit-btns">
              <button className="btn-ghost btn-sm" onClick={() => setEditing(false)}>Cancel</button>
              <button className="btn-accent btn-sm" onClick={saveEdit}>Save</button>
            </div>
          </div>
        ) : (
          <button className="pm-item" onClick={startEdit}>
            <Icon name="edit" size={16} /> Edit display name
          </button>
        )}
        <div className="pm-div" />
        <button className="pm-item" onClick={() => { onClose(); onLogout() }}>
          <Icon name="logout" size={16} /> Sign out
        </button>
      </div>
    </>
  )
}
