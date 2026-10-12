import { CountUp } from './motion.jsx'
import { Spark } from './charts.jsx'
import Icon from './icons.jsx'

export default function StatCard({ icon, value, label, delta, deltaUp, spark, sparkColor, format, delay = 0 }) {
  return (
    <div className="kpi reveal" style={{ '--d': `${delay}ms` }}>
      <div className="klabel">
        <span>{label}</span>
        {icon && <span style={{ color: 'var(--faint)' }}><Icon name={icon} size={16} /></span>}
      </div>
      <div className="num">
        <CountUp value={value} format={format} />
      </div>
      {delta && (
        <div className="delta" style={{ color: deltaUp ? 'var(--success)' : 'var(--danger)' }}>
          <Icon name={deltaUp ? 'trendUp' : 'trendDown'} size={14} />
          {delta}
        </div>
      )}
      {spark && <div className="spark"><Spark data={spark} color={sparkColor || 'var(--accent)'} w={150} h={34} /></div>}
    </div>
  )
}
