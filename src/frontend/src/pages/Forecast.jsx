import { useMemo, useState } from 'react'
import Topbar from '../components/Topbar.jsx'
import Icon from '../components/icons.jsx'
import { TrendChart } from '../components/charts.jsx'
import { Reveal, CountUp } from '../components/motion.jsx'
import ProductCombo from '../components/ProductCombo.jsx'
import { appData, demandLevel, fmt } from '../lib/predict.js'
import { forecastProduct, DOW } from '../lib/forecast.js'

const HORIZONS = [7, 14, 30]

export default function Forecast({ session }) {
  const [code, setCode] = useState(appData.products[0])
  const [horizon, setHorizon] = useState(14)
  const [promoWeekends, setPromoWeekends] = useState(false)
  const prof = appData.product_profiles[code]

  const series = useMemo(() => {
    if (!prof) return []
    return forecastProduct(code, '2016-11-24', horizon, { promoWeekends })
  }, [code, horizon, promoWeekends, prof])

  const total = series.reduce((a, d) => a + d.demand, 0)
  const peak = series.reduce((a, d) => (d.demand > a.demand ? d : a), series[0] || { demand: 0, date: '' })
  const avg = series.length ? total / series.length : 0
  const reorder = Math.ceil(total * 1.15)
  const peakLvl = demandLevel(peak.demand || 0)

  const stats = [
    { v: total, l: `Total forecasted demand · ${horizon}d`, f: fmt },
    { v: avg, l: 'Average per day', f: fmt },
    { v: reorder, l: 'Suggested replenishment (+15% safety)', f: fmt },
  ]

  return (
    <>
      <Topbar title="Forecast planner" sub="Daily demand projections, straight from the trained model." />
      <div className="content">
        <Reveal>
          <div className="panel" style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div className="field" style={{ flex: '1 1 260px', margin: 0 }}>
                <label>Product</label>
                <ProductCombo value={code} onChange={setCode} placeholder="Search 2,117 products…" />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label>Horizon</label>
                <div className="seg">
                  {HORIZONS.map((h) => (
                    <button key={h} type="button" className={horizon === h ? 'on' : ''} onClick={() => setHorizon(h)}>
                      {h} days
                    </button>
                  ))}
                </div>
              </div>
              <label className="check-row" style={{ paddingBottom: 9 }}>
                <input type="checkbox" checked={promoWeekends} onChange={(e) => setPromoWeekends(e.target.checked)} />
                Weekend promo scenario
              </label>
            </div>
            {prof && (
              <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="pill-badge neutral">{prof.warehouse.replace('Whse_', 'Warehouse ')}</span>
                <span className="pill-badge neutral">{prof.category.replace('Category_', 'Category ')}</span>
                <span className="pill-badge accent">Historical avg {fmt(prof.avg_demand)}/day</span>
              </div>
            )}
          </div>
        </Reveal>

        {!prof || !series.length ? (
          <div className="panel"><div className="empty">
            <div className="big"><Icon name="forecast" size={40} /></div>
            Pick a product above to generate its forecast.
          </div></div>
        ) : (
          <>
            <div className="grid kpis" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              {stats.map((k, i) => (
                <Reveal key={i} delay={i * 60}>
                  <div className="kpi">
                    <div className="klabel"><span>{k.l}</span></div>
                    <div className="num"><CountUp value={k.v} format={k.f} /></div>
                  </div>
                </Reveal>
              ))}
              <Reveal delay={180}>
                <div className="kpi">
                  <div className="klabel"><span>Peak day · {peak.date.slice(5)}</span></div>
                  <div className="num" style={{ fontSize: 24 }}>{fmt(peak.demand)}</div>
                  <div style={{ marginTop: 8 }}><span className={`pill-badge ${peakLvl.key}`}>{peakLvl.label}</span></div>
                </div>
              </Reveal>
            </div>

            <Reveal delay={100}>
              <div className="panel hoverable" style={{ marginBottom: 16 }}>
                <div className="panel-head">
                  <div><h3>{code.replace('Product_', 'Product ')} — {horizon}-day outlook</h3>
                    <p className="psub">Daily predictions from {series[0].date} · {promoWeekends ? 'with weekend promos' : 'no promos assumed'}</p></div>
                  <span className="chip">Lasso · α 0.336</span>
                </div>
                <TrendChart
                  series={[{ label: 'Forecast', color: '#4f46e5', fill: true,
                    points: series.map((d) => ({ x: d.date.slice(5), y: d.demand })) }]}
                  height={160}
                />
                <p className="footnote">
                  Weekend uplift reflects 537 high-demand weekend rows in the training data —
                  a pattern to validate before acting on it.
                </p>
              </div>
            </Reveal>

            <Reveal delay={160}>
              <div className="panel">
                <h3>Daily breakdown</h3><p className="psub">Every day of the forecast horizon</p>
                <div style={{ overflowX: 'auto', maxHeight: 360, overflowY: 'auto' }}>
                  <table className="data">
                    <thead><tr><th>Date</th><th>Day</th><th>Promo</th><th>Predicted demand</th><th>Level</th></tr></thead>
                    <tbody>
                      {series.map((d) => {
                        const lvl = demandLevel(d.demand)
                        return (
                          <tr key={d.date}>
                            <td style={{ fontWeight: 600 }}>{d.date}</td>
                            <td>{DOW[d.dow]}</td>
                            <td>{d.promo ? <Icon name="check" size={15} style={{ color: 'var(--success)' }} /> : <span style={{ color: 'var(--faint)' }}>—</span>}</td>
                            <td>{fmt(d.demand)}</td>
                            <td><span className={`pill-badge ${lvl.key}`}>{lvl.label}</span></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </Reveal>
          </>
        )}
      </div>
    </>
  )
}
