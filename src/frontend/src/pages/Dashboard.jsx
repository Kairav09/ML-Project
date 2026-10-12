import { useMemo } from 'react'
import Topbar from '../components/Topbar.jsx'
import StatCard from '../components/StatCard.jsx'
import Icon from '../components/icons.jsx'
import { TrendChart, Bars, Donut } from '../components/charts.jsx'
import { Reveal } from '../components/motion.jsx'
import { appData, demandLevel, fmt } from '../lib/predict.js'
import { recentActual, forecastAggregate, topMovers } from '../lib/forecast.js'

const DONUT_COLORS = ['#4f46e5', '#818cf8', '#a5b4fc', '#6366f1']

export default function Dashboard({ session, go }) {
  const s = appData.stats

  const actual = useMemo(() => recentActual(30), [])
  const outlook = useMemo(() => forecastAggregate('2016-11-24', 7), [])
  const movers = useMemo(() => topMovers(5), [])

  const outlookBars = outlook.map((d) => {
    const dt = new Date(d.date + 'T00:00:00')
    const wknd = dt.getDay() === 0 || dt.getDay() === 6
    return {
      label: `${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dt.getDay()]} ${d.date.slice(5)}`,
      value: d.demand, color: wknd ? '#d97706' : '#4f46e5',
    }
  })
  const sparkVals = actual.map((d) => d.y)
  const whDonut = appData.by_warehouse.map((w, i) => ({
    label: w.warehouse.replace('Whse_', 'Warehouse '), value: w.demand, color: DONUT_COLORS[i % 4],
  }))
  const topCats = appData.by_category.slice(0, 5).map((c) => ({
    label: c.category.replace('Category_', 'Category '), value: c.demand,
  }))

  return (
    <>
      <Topbar
        title={`${daypart()}, ${session.name}`}
        sub="Demand across your network, at a glance."
       
        action={<button className="btn-primary" onClick={() => go('forecast')}>
          <Icon name="plus" size={15} /> New forecast
        </button>}
      />
      <div className="content">
        <div className="grid kpis">
          <StatCard delay={0} icon="box" value={s.total_products} label="Products tracked"
            format={(v) => Math.round(v).toLocaleString('en-IN')}
            delta="2,117 SKUs" deltaUp spark={sparkVals.slice(-14)} />
          <StatCard delay={60} icon="target" value={s.test_r2} label="Forecast model R²"
            format={(v) => v.toFixed(3)} delta="Lasso · 46 features" deltaUp />
          <StatCard delay={120} icon="trendUp" value={s.avg_daily_demand} label="Avg. daily demand"
            format={(v) => fmt(v)} delta="30-day avg" deltaUp
            spark={sparkVals.slice(-14)} sparkColor="#059669" />
          <StatCard delay={180} icon="flag" value={s.demand_alerts} label="High-demand products"
            format={(v) => Math.round(v).toLocaleString('en-IN')}
            delta="needs attention" deltaUp={false} />
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1.9fr 1fr', marginBottom: 16 }}>
          <Reveal delay={80}>
            <div className="panel hoverable" style={{ height: '100%' }}>
              <div className="panel-head">
                <div><h3>Demand trajectory</h3><p className="psub">Actual demand · last 30 days</p></div>
                <span className="chip">Live data</span>
              </div>
              <TrendChart series={[{ label: 'Demand', color: '#4f46e5', fill: true,
                points: actual.map((d) => ({ x: d.x, y: d.y })) }]} />
            </div>
          </Reveal>
          <Reveal delay={140}>
            <div className="panel hoverable" style={{ height: '100%' }}>
              <div className="panel-head">
                <div><h3>7-day outlook</h3><p className="psub">Model's aggregate forecast</p></div>
              </div>
              <Bars data={outlookBars} />
              <p className="footnote">
                Weekend uplift reflects 537 high-demand weekend rows in the training data —
                a pattern to validate before acting on it.
              </p>
            </div>
          </Reveal>
        </div>

        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
          <Reveal delay={100}>
            <div className="panel hoverable" style={{ height: '100%' }}>
              <h3>Warehouse mix</h3><p className="psub">Share of total demand</p>
              <Donut data={whDonut} />
            </div>
          </Reveal>
          <Reveal delay={160}>
            <div className="panel hoverable" style={{ height: '100%' }}>
              <h3>Top categories</h3><p className="psub">Cumulative demand leaders</p>
              <Bars data={topCats} />
            </div>
          </Reveal>
          <Reveal delay={220}>
            <div className="panel hoverable" style={{ height: '100%' }}>
              <div className="panel-head">
                <div><h3>Demand radar</h3><p className="psub">Highest-velocity products</p></div>
                <button className="btn-ghost" onClick={() => go('live')}>View all</button>
              </div>
              {movers.map((m, i) => {
                const lvl = demandLevel(m.avg_demand)
                return (
                  <div className="alert-row" key={m.code}>
                    <div className="alert-rank">{i + 1}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13.5 }}>{m.code.replace('Product_', 'Product ')}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                        {m.warehouse.replace('Whse_', 'WH ')} · {m.category.replace('Category_', 'Cat ')} · {fmt(m.avg_demand)}/day
                      </div>
                    </div>
                    <span className={`pill-badge ${lvl.key}`}>{lvl.label}</span>
                  </div>
                )
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </>
  )
}

function daypart() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}
