import { predictDemand, appData } from './predict.js'

const pad = (n) => String(n).padStart(2, '0')
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x }

/**
 * Forecast daily demand for one product over `days` starting `startIso` (YYYY-MM-DD),
 * using the real trained Lasso model. `opts` overrides per-day inputs
 * (promoWeekends adds a promotion on Sat/Sun — a what-if lever).
 */
export function forecastProduct(productCode, startIso, days, opts = {}) {
  const prof = appData.product_profiles[productCode]
  if (!prof) return []
  const start = new Date(startIso + 'T00:00:00')
  const out = []
  for (let i = 0; i < days; i++) {
    const d = addDays(start, i)
    const dow = (d.getDay() + 6) % 7
    const weekend = dow >= 5
    const input = {
      productCode,
      warehouse: opts.warehouse || prof.warehouse,
      category: opts.category || prof.category,
      date: iso(d),
      open: true,
      promo: opts.promoWeekends ? weekend : !!opts.promo,
      schoolHoliday: false,
      stateHoliday: '0',
      petrolPrice: opts.petrolPrice || appData.stats.petrol_mean,
    }
    const { demand } = predictDemand(input)
    out.push({ date: iso(d), dow, demand: Math.max(0, demand), promo: input.promo })
  }
  return out
}

/** Aggregate forecast: top-N products' daily forecasts, scaled to the full catalog.
 *  Level is scaled multiplicatively by historical share; per-product additive
 *  effects (e.g. the weekend uplift) are measured on the sample and extended
 *  to the remaining products. Everything comes from the model itself. */
export function forecastAggregate(startIso, days, topN = 200) {
  const ranked = Object.entries(appData.product_profiles)
    .sort((a, b) => b[1].avg_demand - a[1].avg_demand)
  const top = ranked.slice(0, topN).map(([code]) => code)
  const n = ranked.length
  const totalAvg = ranked.reduce((a, [, p]) => a + p.avg_demand, 0)
  const topAvg = ranked.slice(0, topN).reduce((a, [, p]) => a + p.avg_demand, 0)
  const scale = totalAvg / Math.max(topAvg, 1)
  const per = top.map((c) => forecastProduct(c, startIso, days))
  const isWknd = (ds) => { const g = new Date(ds + 'T00:00:00').getDay(); return g === 0 || g === 6 }
  const base = per.map((s) => {
    const wd = s.filter((d) => !isWknd(d.date))
    return wd.reduce((a, d) => a + d.demand, 0) / Math.max(wd.length, 1)
  })
  const out = []
  for (let i = 0; i < days; i++) {
    const date = per[0][i].date
    const scaled = per.reduce((a, s) => a + s[i].demand, 0) * scale
    const meanUplift = per.reduce((a, s, j) => a + (s[i].demand - base[j]), 0) / topN
    out.push({ date, demand: Math.max(0, scaled + (n - topN) * meanUplift) })
  }
  return out
}

/** Recent actual daily totals for the last `days` of data. */
export function recentActual(days = 30) {
  return appData.daily.slice(-days).map((d) => ({ x: d.date.slice(5), y: d.demand, full: d.date }))
}

/** Top products by recent average demand (for alerts). */
export function topMovers(n = 6) {
  return Object.entries(appData.product_profiles)
    .sort((a, b) => b[1].avg_demand - a[1].avg_demand)
    .slice(0, n)
    .map(([code, p]) => ({ code, ...p }))
}

export const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
