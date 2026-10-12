import { useEffect, useState } from 'react'
import Icon from './icons.jsx'
import { saveProfile } from '../lib/profile.js'

export default function AuthModal({ mode, setMode, onLogin, onClose }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const esc = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', esc)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', esc)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const submit = (e) => {
    e.preventDefault()
    if (mode === 'register') {
      // register -> remember the name, then ask them to sign in
      saveProfile(email, name.trim())
      setMode('login')
      setPassword('')
      setNotice('Account created — sign in to continue.')
      return
    }
    const fallback = email.split('@')[0] || 'Planner'
    onLogin(fallback, email, false)
  }

  const switchMode = (m) => { setNotice(''); setMode(m) }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose} aria-label="Close">
          <Icon name="x" size={16} />
        </button>
        <form className="login-card" onSubmit={submit}>
          <div className="login-mark"><Icon name="logo" size={24} /></div>
          <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
          <p className="sub">
            {mode === 'login' ? 'Sign in to your demand forecasting workspace.' : 'Start forecasting demand in minutes.'}
          </p>
          {mode === 'register' && (
            <div className="field">
              <label>Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Lovelace" required />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {notice && (
            <div style={{
              fontSize: 13, fontWeight: 550, color: '#a7f3d0',
              background: 'rgba(16, 185, 129, .1)', border: '1px solid rgba(16, 185, 129, .3)',
              padding: '10px 14px', borderRadius: 10, marginBottom: 4,
            }}>{notice}</div>
          )}
          <button className="btn-accent" type="submit" style={{ width: '100%', marginTop: 6 }}>
            {mode === 'login' ? 'Sign in' : 'Create account'}
            <Icon name="arrowUR" size={16} />
          </button>
          <div className="login-alt">
            {mode === 'login' ? (
              <>New to Demand AI? <button type="button" onClick={() => switchMode('register')}>Create an account</button></>
            ) : (
              <>Already have an account? <button type="button" onClick={() => switchMode('login')}>Sign in</button></>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
