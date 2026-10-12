// Hand-drawn stroke icon set — 24×24, 2px stroke, round caps. No emoji, no unicode glyphs.
const P = {
  logo: (<><path d="M3.5 16.5L9 11l3.5 3.5L20.5 6.5" /><path d="M15.5 6.5h5v5" /></>),
  dashboard: (<><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>),
  forecast: (<><rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" /><path d="M9.5 15.5l2 2 3.5-4" /></>),
  sparkles: (<><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" /><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" /></>),
  activity: (<path d="M3 12h4l3 8 4-16 3 8h4" />),
  report: (<><path d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-12.5L14 2.5z" /><path d="M14 2.5V8h5.5" /><path d="M9 13.5v4M12 11.5v6M15 14.5v3" /></>),
  sliders: (<><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2.2" /><circle cx="10" cy="17" r="2.2" /></>),
  logout: (<><path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" /><path d="M16 17l5-5-5-5M21 12H9" /></>),
  search: (<><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>),
  box: (<><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" /><path d="M3.3 8.3L12 13l8.7-4.7M12 13v9" /></>),
  trendUp: (<><path d="M3 17l6-6 4 4 8-8" /><path d="M15 7h6v6" /></>),
  trendDown: (<><path d="M3 7l6 6 4-4 8 8" /><path d="M15 17h6v-6" /></>),
  alert: (<><path d="M12 3.5L22 20H2L12 3.5z" /><path d="M12 10v4M12 17.5v.01" /></>),
  check: (<path d="M4.5 12.5l5 5 10-11" />),
  checkCircle: (<><circle cx="12" cy="12" r="9" /><path d="M8.5 12.5l2.5 2.5 5-5.5" /></>),
  chevronDown: (<path d="M6 9l6 6 6-6" />),
  calendar: (<><rect x="3" y="4.5" width="18" height="16" rx="2.5" /><path d="M3 9.5h18M8 2.5v4M16 2.5v4" /></>),
  x: (<path d="M6 6l12 12M18 6L6 18" />),
  edit: (<><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" /></>),
  moon: (<path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />),
  sun: (<><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>),
  plus: (<path d="M12 5v14M5 12h14" />),
  arrowUR: (<><path d="M7 17L17 7" /><path d="M8 7h9v9" /></>),
  arrowDR: (<><path d="M7 7l10 10" /><path d="M8 17h9v-9" /></>),
  minus: (<path d="M5 12h14" />),
  clock: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3.5 2" /></>),
  layers: (<><path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 13l9 5 9-5" /></>),
  zap: (<path d="M13 2.5L4.5 13.5H11L10 21.5L19.5 10H13L13 2.5z" />),
  database: (<><ellipse cx="12" cy="5.5" rx="8" ry="3" /><path d="M4 5.5V18.5c0 1.7 3.6 3 8 3s8-1.3 8-3V5.5" /><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></>),
  flag: (<><path d="M5 21V4" /><path d="M5 4.5h13l-2.5 4L18 12.5H5" /></>),
  target: (<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.2" /></>),
}

export default function Icon({ name, size = 20, strokeWidth = 2, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }} aria-hidden="true">
      {P[name] || null}
    </svg>
  )
}
