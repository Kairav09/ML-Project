import { useState, useRef, useEffect } from 'react'

/** Minimal multi-series line chart with hover tooltip.
 *  Measures its own pixel width and renders at a fixed pixel height,
 *  so charts stay compact on wide screens instead of scaling up. */
export function TrendChart({ series, height = 200, formatY }) {
  const H = height, YP = 56
  const [hover, setHover] = useState(null)
  const [w, setW] = useState(640)
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setW(Math.max(el.clientWidth, 200))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const W = w
  const all = series.flatMap((s) => s.points.map((p) => p.y))
  const max = Math.max(...all), min = Math.min(0, ...all)
  const span = max - min || 1
  const n = Math.max(...series.map((s) => s.points.length))
  const px = (i) => YP + (i / Math.max(n - 1, 1)) * (W - YP - 10)
  const py = (v) => 14 + (1 - (v - min) / span) * (H - 56)
  const fy = (v) => (formatY ? formatY(v) : Math.round(v).toLocaleString('en-IN'))
  const step = Math.ceil(n / 8)

  const onMove = (e) => {
    const rect = ref.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * W
    let best = 0, bd = Infinity
    for (let i = 0; i < n; i++) { const d = Math.abs(px(i) - x); if (d < bd) { bd = d; best = i } }
    setHover(best)
  }

  const tipW = 150, tipH = 24 + series.length * 18
  const tx = hover != null ? Math.min(Math.max(px(hover) - tipW / 2, YP), W - tipW - 6) : 0

  return (
    <svg ref={ref} width="100%" height={H} viewBox={`0 0 ${W} ${H}`} onMouseMove={onMove} onMouseLeave={() => setHover(null)}
      style={{ display: 'block', cursor: 'crosshair' }}>
      {[0, 0.5, 1].map((t) => {
        const v = min + (max - min) * t
        return (
          <g key={t}>
            <line x1={YP} x2={W - 8} y1={py(v)} y2={py(v)} style={{ stroke: "var(--line-soft)" }} />
            <text x={YP - 10} y={py(v) + 4} fontSize="10.5" textAnchor="end" style={{ fill: "var(--muted)" }}>{fy(v)}</text>
          </g>
        )
      })}
      {series.map((s, si) => {
        const pts = s.points.map((p, i) => `${px(i).toFixed(1)},${py(p.y).toFixed(1)}`).join(' ')
        return (
          <g key={si}>
            {s.fill && (
              <polygon points={`${px(0)},${H - 30} ${pts} ${px(s.points.length - 1)},${H - 30}`}
                fill={s.color} opacity="0.07" />
            )}
            <path d={`M${pts.replaceAll(' ', ' L')}`} fill="none" stroke={s.color} strokeWidth="2.2"
              strokeLinejoin="round" strokeLinecap="round" pathLength="1"
              className="chart-line" style={{ animationDelay: `${0.15 + si * 0.2}s` }}
              strokeDasharray={s.dashed ? '6 5' : undefined} />
          </g>
        )
      })}
      {series[0].points.map((p, i) =>
        i % step === 0 ? (
          <text key={i} x={px(i)} y={H - 8} fontSize="10.5" textAnchor="middle" style={{ fill: "var(--muted)" }}>{p.x}</text>
        ) : null
      )}
      {hover != null && (
        <g className="pop">
          <line x1={px(hover)} x2={px(hover)} y1={12} y2={H - 30} strokeDasharray="3 3" style={{ stroke: "var(--line-strong)" }} />
          {series.map((s, si) => (
            <circle key={si} cx={px(hover)} cy={py(s.points[hover].y)} r="4.5"
              stroke={s.color} strokeWidth="2.5" style={{ fill: "var(--surface)" }} />
          ))}
          <rect x={tx} y={16} width={tipW} height={tipH} rx="9" opacity="0.94" style={{ fill: "var(--tip-bg)" }} />
          <text x={tx + 12} y={34} fontSize="11" fontWeight="600" style={{ fill: "var(--tip-fg)" }}>
            {series[0].points[hover].x}
          </text>
          {series.map((s, si) => (
            <g key={si}>
              <circle cx={tx + 17} cy={48 + si * 18} r="3.5" fill={s.color} />
              <text x={tx + 27} y={52 + si * 18} fontSize="11" style={{ fill: "var(--tip-muted)" }}>
                {s.label}: {fy(s.points[hover].y)}
              </text>
            </g>
          ))}
        </g>
      )}
    </svg>
  )
}

/** Minimal horizontal bars. */
export function Bars({ data, height = 7 }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div>
      {data.map((d, i) => (
        <div key={i} style={{ marginBottom: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5 }}>
            <span style={{ color: 'var(--ink-2)', fontWeight: 500 }}>{d.label}</span>
            <span style={{ color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
              {Math.round(d.value).toLocaleString('en-IN')}
            </span>
          </div>
          <div className="bar-track" style={{ height }}>
            <div className="bar-fill" style={{
              height: '100%', width: `${(d.value / max) * 100}%`,
              background: d.color || 'var(--accent)', borderRadius: 99, '--d': `${i * 70}ms`
            }} />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Minimal progress ring. */
export function Ring({ value, max = 1, size = 110, color = '#4f46e5', label, sub }) {
  const r = (size - 14) / 2, c = 2 * Math.PI * r
  const off = c * (1 - Math.min(1, value / max))
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth="11" style={{ stroke: "var(--line-soft)" }} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="11"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          transform={`rotate(-90 ${size / 2} ${size / 2})`} className="ring-fg" />
        <text x="50%" y="48%" textAnchor="middle" fontSize="24" fontWeight="700"
          style={{ fill: 'var(--ink)', letterSpacing: '-0.02em' }}>{label}</text>
        {sub && <text x="50%" y="63%" textAnchor="middle" fontSize="10.5" style={{ fill: "var(--muted)" }}>{sub}</text>}
      </svg>
    </div>
  )
}

/** Minimal sparkline. */
export function Spark({ data, color = '#4f46e5', w = 120, h = 32 }) {
  const max = Math.max(...data), min = Math.min(...data), span = max - min || 1
  const pts = data.map((v, i) =>
    `${(i / Math.max(data.length - 1, 1)) * w},${h - 3 - ((v - min) / span) * (h - 8)}`).join(' ')
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill={color} opacity="0.08" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

/** Minimal donut. */
export function Donut({ data, size = 150 }) {
  const total = data.reduce((a, d) => a + d.value, 0) || 1
  const r = (size - 22) / 2, c = 2 * Math.PI * r
  let acc = 0
  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth="18" style={{ stroke: "var(--line-soft)" }} />
        {data.map((d, i) => {
          const frac = d.value / total
          const el = (
            <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={d.color}
              strokeWidth="18" strokeDasharray={`${frac * c} ${c}`}
              strokeDashoffset={-acc * c} transform={`rotate(-90 ${size / 2} ${size / 2})`}
              className="ring-fg" />
          )
          acc += frac
          return el
        })}
        <text x="50%" y="47%" textAnchor="middle" fontSize="20" fontWeight="700" style={{ fill: "var(--ink)" }}>{data.length}</text>
        <text x="50%" y="61%" textAnchor="middle" fontSize="10.5" style={{ fill: "var(--muted)" }}>warehouses</text>
      </svg>
      <div style={{ flex: 1 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, marginBottom: 9 }}>
            <span style={{ width: 9, height: 9, borderRadius: 3, background: d.color }} />
            <span style={{ color: '#3f3f46', fontWeight: 500 }}>{d.label}</span>
            <span style={{ marginLeft: 'auto', color: 'var(--muted)', fontVariantNumeric: 'tabular-nums' }}>
              {Math.round((d.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
