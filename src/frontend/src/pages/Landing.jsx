import Icon from '../components/icons.jsx'
import ScrollReveal from '../components/ScrollReveal.jsx'
import AuthModal from '../components/AuthModal.jsx'
import { CountUp } from '../components/motion.jsx'
import { fmt } from '../lib/predict.js'

const FEATS = [
  { icon: 'forecast', t: 'Forecast planner', d: 'Project daily demand for any of 2,117 products across 7, 14 or 30 days — with peak-day detection and replenishment suggestions.' },
  { icon: 'sparkles', t: 'Scenario compare', d: 'Run a baseline forecast side-by-side with a promotion scenario and see the exact demand delta before committing stock.' },
  { icon: 'activity', t: 'Live demand radar', d: 'Fresh demand signals stream in across warehouses, automatically flagged low to very-high so nothing spikes unnoticed.' },
  { icon: 'target', t: 'A real model, in-browser', d: 'The trained Lasso regression runs entirely on-device. Predictions in milliseconds, key drivers explained for every number.' },
]

const STEPS = [
  { t: 'Describe the situation', d: 'Pick a product, warehouse, date and conditions — promos, holidays, petrol price. The same features the model trained on.' },
  { t: 'Run the model', d: 'The Lasso model scores demand instantly in your browser and shows which drivers moved the number.' },
  { t: 'Plan with confidence', d: 'Turn forecasts into replenishment quantities, compare scenarios, and export the thinking into reports.' },
]

function HeroVisual() {
  const pts = [42, 55, 48, 62, 58, 74, 68, 82, 76, 92]
  const w = 560, h = 190
  const path = pts.map((v, i) => `${(i / (pts.length - 1)) * w},${h - 14 - (v / 100) * (h - 40)}`).join(' L')
  return (
    <div className="mock-dash">
      <div className="mock-row">
        {[['Products', '2,117'], ['Model R²', '0.327'], ['Avg daily', '23.6L']].map(([l, n]) => (
          <div className="mock-kpi" key={l}>
            <div className="mk-l">{l}</div><div className="mk-n">{n}</div>
          </div>
        ))}
      </div>
      <div className="mock-chart">
        <div className="mk-l" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', color: '#71717a', marginBottom: 12 }}>
          Demand trajectory
        </div>
        <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          <polygon points={`0,${h} ${path.replaceAll(' L', ' ')} ${w},${h}`} fill="#4f46e5" opacity="0.1" />
          <path d={`M${path}`} fill="none" stroke="#818cf8" strokeWidth="2.5"
            strokeLinecap="round" pathLength="1" className="chart-line" />
          <circle cx={w} cy={h - 14 - (92 / 100) * (h - 40)} r="5" fill="#4f46e5" stroke="#fff" strokeWidth="2.5" />
        </svg>
      </div>
    </div>
  )
}

export default function Landing({ authOpen, authMode, setAuthMode, openAuth, closeAuth, onLogin }) {
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  return (
    <div className="lp">
      <nav className="lp-nav">
        <div className="lp-brand">
          <span className="mark"><Icon name="logo" size={20} /></span> Demand AI
        </div>
        <div className="lp-links">
          <a onClick={() => go('features')} style={{ cursor: 'pointer' }}>Features</a>
          <a onClick={() => go('how')} style={{ cursor: 'pointer' }}>How it works</a>
          <a onClick={() => go('model')} style={{ cursor: 'pointer' }}>Model</a>
        </div>
        <div className="actions">
          <button className="btn-ghost-light" onClick={() => openAuth('login')}>Sign in</button>
          <button className="btn-accent" onClick={() => openAuth('register')}>Get started</button>
        </div>
      </nav>

      <header className="lp-hero">
        <div className="glow g1" style={{ top: 40, left: '8%' }} />
        <div className="reveal" style={{ position: 'relative' }}>
          <span className="lp-badge"><span className="dot" /> Ridge &amp; Lasso · runs in your browser</span>
          <h1>Know tomorrow's demand, <span className="grad-text">today.</span></h1>
          <p className="sub">
            Demand AI puts your trained forecasting model behind a planner-grade workspace —
            forecast any product, compare promo scenarios, and turn predictions into replenishment decisions.
          </p>
          <div className="lp-ctas">
            <button className="btn-accent btn-lg" onClick={() => openAuth('register')}>
              Start forecasting <Icon name="arrowUR" size={16} />
            </button>
            <button className="btn-ghost-light btn-lg" onClick={() => go('how')}>See how it works</button>
          </div>
        </div>
        <div className="lp-visual reveal" style={{ '--d': '250ms' }}>
          <div className="glow-behind" />
          <HeroVisual />
        </div>
        <div className="lp-stats">
          {[
            [2117, 'products tracked', (v) => Math.round(v).toLocaleString('en-IN')],
            [169211, 'retail records', (v) => Math.round(v).toLocaleString('en-IN')],
            [0.327, 'test R² (Lasso)', (v) => v.toFixed(3)],
            [14, 'features auto-zeroed', (v) => Math.round(v)],
          ].map(([v, l, f], i) => (
            <div className="lp-stat reveal" style={{ '--d': `${i * 90}ms` }} key={l}>
              <div className="n"><CountUp value={v} format={f} duration={1600} /></div>
              <div className="l">{l}</div>
            </div>
          ))}
        </div>
      </header>

      <section className="lp-section" id="features">
        <ScrollReveal>
          <div className="lp-kicker">Features</div>
          <h2>Everything a planner needs, nothing they don't.</h2>
          <p className="lede">A focused workspace around one job: turning demand forecasts into inventory decisions.</p>
        </ScrollReveal>
        <div className="lp-feats">
          {FEATS.map((f, i) => (
            <ScrollReveal key={f.t} delay={i * 80}>
              <div className="lp-feat">
                <div className="ico"><Icon name={f.icon} size={22} /></div>
                <h3>{f.t}</h3><p>{f.d}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="lp-section" id="how">
        <ScrollReveal>
          <div className="lp-kicker">How it works</div>
          <h2>From question to forecast in seconds.</h2>
        </ScrollReveal>
        <div className="lp-steps">
          {STEPS.map((s, i) => (
            <ScrollReveal key={s.t} delay={i * 100}>
              <div className="lp-step">
                <div className="num">{i + 1}</div>
                <h3>{s.t}</h3><p>{s.d}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="lp-section" id="model">
        <ScrollReveal>
          <div className="lp-kicker">The model</div>
          <h2>Interpretable by design.</h2>
          <p className="lede">Lasso regression with 5-fold cross-validation — chosen over OLS and Ridge for built-in feature selection at equal accuracy.</p>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <div className="lp-model">
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 54, fontWeight: 700, letterSpacing: '-0.03em' }}>0.327</div>
              <div style={{ color: '#71717a', fontSize: 13, marginTop: 6 }}>test R² score</div>
            </div>
            <div>
              <p style={{ color: '#a1a1aa', fontSize: 14.5, lineHeight: 1.7 }}>
                Trained on 118,447 retail records with 99th-percentile outlier capping and
                train-only target encoding of product codes. Every prediction ships with its
                key drivers, so the number is never a black box.
              </p>
              <div className="chips">
                {['Lasso (L1) · α 0.336', 'Test RMSE ±9,317', '46 features', '14 zeroed by Lasso', 'Runs 100% in-browser'].map((c) => (
                  <span className="mchip" key={c}>{c}</span>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section className="lp-cta">
        <ScrollReveal>
          <h2>Ready to forecast?</h2>
          <p>Spin up your workspace and run your first prediction in under a minute.</p>
          <button className="btn-accent btn-lg" onClick={() => openAuth('register')}>
            Get started free <Icon name="arrowUR" size={16} />
          </button>
        </ScrollReveal>
      </section>

      <footer className="lp-footer">
        <div className="fbrand"><span className="mark" style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Icon name="logo" size={16} /></span> Demand AI</div>
        <div>Product demand forecasting · Ridge &amp; Lasso</div>
      </footer>

      {authOpen && (
        <AuthModal mode={authMode} setMode={setAuthMode} onLogin={onLogin} onClose={closeAuth} />
      )}
    </div>
  )
}
