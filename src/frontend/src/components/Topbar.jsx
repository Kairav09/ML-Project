import Icon from './icons.jsx'

export default function Topbar({ title, sub, action }) {
  const now = new Date()
  return (
    <div className="topbar">
      <div>
        <h1>{title}</h1>
        {sub && <div className="sub">{sub}</div>}
      </div>
      <div className="top-actions">
        <div className="date-pill">
          <Icon name="calendar" size={15} />
          {now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
        </div>
        {action}
      </div>
    </div>
  )
}
