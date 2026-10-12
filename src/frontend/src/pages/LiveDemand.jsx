import { useState } from 'react'
import Topbar from '../components/Topbar.jsx'
import Icon from '../components/icons.jsx'
import { Reveal } from '../components/motion.jsx'
import { appData, demandLevel, fmt, fmtDate } from '../lib/predict.js'

export default function LiveDemand({ session }) {
  const [q, setQ] = useState('')
  const rows = appData.live_rows.filter((r) => {
    const s = q.trim().toLowerCase()
    return !s || r.product.toLowerCase().includes(s) || r.warehouse.toLowerCase().includes(s) || r.category.toLowerCase().includes(s)
  })

  return (
    <>
      <Topbar title="Live demand" sub="Fresh demand signals across the network." />
      <div className="content">
        <Reveal>
          <div className="panel">
            <div className="toolbar">
              <div className="search-wrap" style={{ minWidth: 320 }}>
                <Icon name="search" size={16} />
                <input type="text" placeholder="Search product, warehouse, category…" value={q}
                  onChange={(e) => setQ(e.target.value)} style={{ width: '100%' }} />
              </div>
              <span className="chip">{rows.length} records</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data">
                <thead><tr><th>Product</th><th>Warehouse</th><th>Category</th><th>Date</th><th>Demand</th><th>Signal</th></tr></thead>
                <tbody>
                  {rows.map((r, i) => {
                    const lvl = demandLevel(r.demand)
                    return (
                      <tr key={i}>
                        <td style={{ fontWeight: 600 }}>{r.product.replace('Product_', 'P-')}</td>
                        <td><span className="pill-badge neutral">{r.warehouse.replace('Whse_', 'WH ')}</span></td>
                        <td style={{ color: 'var(--ink-2)' }}>{r.category.replace('Category_', 'Cat ')}</td>
                        <td style={{ color: 'var(--muted)' }}>{fmtDate(r.date)}</td>
                        <td style={{ fontWeight: 600 }}>{fmt(r.demand)}</td>
                        <td><span className={`pill-badge ${lvl.key}`}>{lvl.label}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </div>
    </>
  )
}
