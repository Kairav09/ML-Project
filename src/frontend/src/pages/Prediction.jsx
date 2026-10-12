import { useState } from 'react'
import Topbar from '../components/Topbar.jsx'
import Icon from '../components/icons.jsx'
import { Reveal } from '../components/motion.jsx'
import ProductCombo from '../components/ProductCombo.jsx'
import { appData, predictDemand, demandLevel, fmt, model } from '../lib/predict.js'

export default function Prediction({ session }) {
  const first = appData.products[0]
  const [form, setForm] = useState({
    productCode: first,
    warehouse: appData.product_profiles[first].warehouse,
    category: appData.product_profiles[first].category,
    date: '2016-11-23',
    promo: false, schoolHoliday: false, stateHoliday: '0',
    petrolPrice: appData.stats.petrol_mean, open: true,
  })
  const [result, setResult] = useState(null)
  const [compare, setCompare] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const onProduct = (code) => {
    const p = appData.product_profiles[code]
    setForm((f) => ({ ...f, productCode: code, ...(p ? { warehouse: p.warehouse, category: p.category } : {}) }))
  }

  const run = (e) => {
    e.preventDefault()
    if (!form.date || !appData.product_profiles[form.productCode]) return
    const base = predictDemand(form)
    const alt = compare ? predictDemand({ ...form, promo: true }) : null
    setResult({ base: { ...base, level: demandLevel(base.demand) }, alt: alt && { ...alt, level: demandLevel(alt.demand) } })
  }

  const delta = result?.alt ? result.alt.demand - result.base.demand : 0
  const deltaPct = result && result.base.demand ? (delta / result.base.demand) * 100 : 0

  return (
    <>
      <Topbar title="Demand prediction" sub="One product, one date — answered by the trained Lasso model." />
      <div className="content">
        <div className="grid" style={{ gridTemplateColumns: '1.05fr 1fr', alignItems: 'start' }}>
          <Reveal>
            <div className="panel">
              <h3>Inputs</h3><p className="psub">The same features the model trained on</p>
              <form onSubmit={run}>
                <div className="field">
                  <label>Product</label>
                  <ProductCombo value={form.productCode} onChange={onProduct} placeholder="Search products…" required />
                </div>
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="field">
                    <label>Warehouse</label>
                    <select value={form.warehouse} onChange={(e) => set('warehouse', e.target.value)}>
                      {appData.warehouses.map((w) => <option key={w} value={w}>{w.replace('Whse_', 'Warehouse ')}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Category</label>
                    <select value={form.category} onChange={(e) => set('category', e.target.value)}>
                      {appData.categories.map((c) => <option key={c} value={c}>{c.replace('Category_', 'Category ')}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Date</label>
                    <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} required />
                  </div>
                  <div className="field">
                    <label>State holiday</label>
                    <select value={form.stateHoliday} onChange={(e) => set('stateHoliday', e.target.value)}>
                      <option value="0">None</option><option value="a">Type A</option><option value="b">Type B</option>
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label>Petrol price</label>
                  <input type="number" step="0.01" value={form.petrolPrice} onChange={(e) => set('petrolPrice', parseFloat(e.target.value) || 0)} />
                </div>
                <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', margin: '2px 0 14px' }}>
                  <label className="check-row"><input type="checkbox" checked={form.promo} onChange={(e) => set('promo', e.target.checked)} /> Promotion</label>
                  <label className="check-row"><input type="checkbox" checked={form.schoolHoliday} onChange={(e) => set('schoolHoliday', e.target.checked)} /> School holiday</label>
                  <label className="check-row"><input type="checkbox" checked={form.open} onChange={(e) => set('open', e.target.checked)} /> Store open</label>
                </div>
                <label className="check-row" style={{ marginBottom: 16, background: 'var(--accent-soft)', border: '1px solid var(--accent-border)', padding: '11px 14px', borderRadius: 10 }}>
                  <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} />
                  <span><b>Compare scenarios</b> <span style={{ color: 'var(--muted)' }}>— also forecast with a promotion</span></span>
                </label>
                <button className="btn-accent" type="submit" style={{ width: '100%' }}>
                  <Icon name="sparkles" size={16} /> Predict demand
                </button>
              </form>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="panel">
              {!result ? (
                <div className="empty">
                  <div className="big"><Icon name="sparkles" size={40} /></div>
                  Fill in the inputs and run a prediction.<br />The model answers in milliseconds.
                </div>
              ) : (
                <div className="pop">
                  <div className="result-hero">
                    <span className={`pill-badge ${result.base.level.key}`} style={{ fontSize: 12 }}>{result.base.level.label} demand</span>
                    <div className="big-num" style={{ margin: '12px 0 4px' }}>{fmt(result.base.demand)}</div>
                    <div style={{ color: 'var(--muted)', fontSize: 13 }}>predicted units · ±{fmt(model.test_rmse)} RMSE</div>
                  </div>
                  {result.alt && (
                    <div className={`delta-card ${delta >= 0 ? 'up' : 'down'}`}>
                      <b>Promo scenario: {fmt(result.alt.demand)} units</b><br />
                      {delta >= 0 ? '+' : '−'}{fmt(Math.abs(delta))} units ({deltaPct >= 0 ? '+' : ''}{deltaPct.toFixed(1)}%) vs baseline —{' '}
                      {delta >= 0 ? 'the promotion lifts demand.' : 'demand softens under this scenario.'}
                    </div>
                  )}
                  <div style={{ marginTop: 20 }}>
                    <h3 style={{ fontSize: 12.5, marginBottom: 6, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                      Key drivers
                    </h3>
                    {result.base.drivers.map((d, i) => (
                      <div className="driver-row" key={i}>
                        <span style={{ color: 'var(--ink-2)' }}>{d.name}</span>
                        <span style={{ fontWeight: 600, color: d.value >= 0 ? 'var(--success)' : 'var(--danger)', fontVariantNumeric: 'tabular-nums' }}>
                          {d.value >= 0 ? '+' : '−'}{fmt(Math.abs(d.value))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </>
  )
}
