import { useState } from 'react'
import Topbar from '../components/Topbar.jsx'
import Icon from '../components/icons.jsx'
import { Ring } from '../components/charts.jsx'
import { Reveal } from '../components/motion.jsx'
import { model, fmt } from '../lib/predict.js'

function Toggle({ on, set }) {
  return <button type="button" className={'toggle' + (on ? ' on' : '')} onClick={() => set(!on)} aria-pressed={on} />
}

const ROW = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', fontSize: 13.5 }

export default function Settings({ session }) {
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [weekly, setWeekly] = useState(false)
  const [highOnly, setHighOnly] = useState(true)

  return (
    <>
      <Topbar title="Settings" sub="Workspace preferences and model card." />
      <div className="content">
        <Reveal>
          <div className="panel" style={{ marginBottom: 16 }}>
            <h3>Notifications</h3><p className="psub">Alert preferences</p>
            <div style={{ ...ROW, borderBottom: '1px solid var(--line-soft)' }}>
              <span>Demand spike alerts</span><Toggle on={emailAlerts} set={setEmailAlerts} /></div>
            <div style={{ ...ROW, borderBottom: '1px solid var(--line-soft)' }}>
              <span>Weekly summary</span><Toggle on={weekly} set={setWeekly} /></div>
            <div style={ROW}>
              <span>High demand only</span><Toggle on={highOnly} set={setHighOnly} /></div>
          </div>
        </Reveal>
        <Reveal delay={140}>
          <div className="panel">
            <div className="panel-head">
              <div><h3>Model card</h3><p className="psub">The Lasso model behind every prediction</p></div>
              <span className="chip">v1.0 · production</span>
            </div>
            <div className="grid" style={{ gridTemplateColumns: '200px 1fr', gap: 28, alignItems: 'center' }}>
              <Ring value={model.test_r2} max={1} label={model.test_r2.toFixed(2)} sub="test R²" />
              <div>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  {[
                    ['Algorithm', 'Lasso (L1)'], ['Best α · 5-fold CV', model.alpha.toFixed(3)],
                    ['Test RMSE', fmt(model.test_rmse)], ['Features', `${model.features.length} total`],
                    ['Zeroed by Lasso', '14 features'], ['Training rows', '118,447'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 10, padding: '12px 14px' }}>
                      <div style={{ fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.07em', fontWeight: 600 }}>{k}</div>
                      <div style={{ fontSize: 16, fontWeight: 650, marginTop: 4, letterSpacing: '-0.01em' }}>{v}</div>
                    </div>
                  ))}
                </div>
                <p className="footnote" style={{ marginTop: 14 }}>
                  Target: Order_Demand capped at the 99th percentile. Product_Code target-encoded on the
                  training fold only; numeric features standardized. Compared against OLS and RidgeCV —
                  Lasso chosen for built-in feature selection at equal accuracy.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </>
  )
}
