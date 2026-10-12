import { useState } from 'react'
import Topbar from '../components/Topbar.jsx'
import StatCard from '../components/StatCard.jsx'
import Icon from '../components/icons.jsx'
import { TrendChart, Bars } from '../components/charts.jsx'
import { Reveal } from '../components/motion.jsx'
import { appData, fmt, fmtDate } from '../lib/predict.js'

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** Collapse dense daily data into readable buckets so big ranges don't turn to noise. */
function aggregate(rows) {
  const n = rows.length
  if (n <= 62) {
    return { granularity: 'Daily', points: rows.map((d) => ({ x: d.date.slice(5), y: d.demand })) }
  }
  if (n <= 186) {
    const points = []
    for (let i = 0; i < n; i += 7) {
      const chunk = rows.slice(i, i + 7)
      points.push({ x: chunk[0].date.slice(5), y: chunk.reduce((a, r) => a + r.demand, 0) / chunk.length })
    }
    return { granularity: 'Weekly avg', points }
  }
  const buckets = new Map()
  for (const r of rows) {
    const key = r.date.slice(0, 7)
    if (!buckets.has(key)) buckets.set(key, { sum: 0, n: 0, key })
    const b = buckets.get(key)
    b.sum += r.demand; b.n += 1
  }
  return {
    granularity: 'Monthly avg',
    points: [...buckets.values()].map((b) => ({
      x: `${MON[parseInt(b.key.slice(5), 10) - 1]} ${b.key.slice(2, 4)}`,
      y: b.sum / b.n,
    })),
  }
}

export default function Reports({ session }) {
  const s = appData.stats
  const [from, setFrom] = useState(s.date_min)
  const [to, setTo] = useState(s.date_max)
  const [report, setReport] = useState(null)

  const generate = (e) => {
    e.preventDefault()
    const rows = appData.daily.filter((d) => d.date >= from && d.date <= to)
    if (!rows.length) { setReport(null); return }
    const total = rows.reduce((a, r) => a + r.demand, 0)
    const peak = rows.reduce((a, r) => (r.demand > a.demand ? r : a), rows[0])
    setReport({ rows, total, peak, days: rows.length, avg: total / rows.length, flow: aggregate(rows) })
  }

  return (
    <>
      <Topbar title="Reports" sub="Demand analytics for any window of time." />
      <div className="content">
        <Reveal>
          <div className="panel" style={{ marginBottom: 16 }}>
            <form onSubmit={generate} className="toolbar" style={{ margin: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 550 }}>From</span>
              <input type="date" value={from} min={s.date_min} max={s.date_max} onChange={(e) => setFrom(e.target.value)} />
              <span style={{ fontSize: 13, fontWeight: 550 }}>To</span>
              <input type="date" value={to} min={s.date_min} max={s.date_max} onChange={(e) => setTo(e.target.value)} />
              <button className="btn-primary" type="submit">
                <Icon name="report" size={15} /> Generate report
              </button>
            </form>
          </div>
        </Reveal>

        {!report ? (
          <div className="panel"><div className="empty">
            <div className="big"><Icon name="report" size={40} /></div>
            Choose a date range and generate your report.
          </div></div>
        ) : (
          <div className="pop">
            <div className="grid kpis" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              <StatCard icon="database" value={report.total} label="Total demand" format={fmt} />
              <StatCard icon="activity" value={report.avg} label="Daily average" format={fmt} />
              <StatCard icon="trendUp" value={report.peak.demand} label={`Peak · ${fmtDate(report.peak.date)}`} format={fmt} />
              <StatCard icon="clock" value={report.days} label="Days analyzed" format={(v) => Math.round(v)} />
            </div>
            <Reveal delay={80}>
              <div className="panel hoverable" style={{ marginBottom: 16 }}>
                <div className="panel-head">
                  <div>
                    <h3>Demand flow</h3><p className="psub">{fmtDate(from)} → {fmtDate(to)}</p>
                  </div>
                  {report.flow.granularity !== 'Daily' && (
                    <span className="chip">{report.flow.granularity}</span>
                  )}
                </div>
                <TrendChart series={[{ label: 'Demand', color: '#4f46e5', fill: true,
                  points: report.flow.points }]} height={200} />
              </div>
            </Reveal>
            <Reveal delay={140}>
              <div className="panel">
                <h3>Category leaderboard</h3><p className="psub">All-time cumulative demand</p>
                <Bars data={appData.by_category.slice(0, 5).map((c) => ({
                  label: c.category.replace('Category_', 'Category '), value: c.demand,
                }))} />
              </div>
            </Reveal>
          </div>
        )}
      </div>
    </>
  )
}
