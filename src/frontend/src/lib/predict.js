import model from '../data/model.json'
import appData from '../data/app-data.json'

const T = appData.thresholds

/**
 * Replicates src/final.ipynb pipeline in JS:
 *  - Date -> Year/Month/Day/DayOfWeek (Mon=0), Is_Weekend, Promo_Or_Holiday
 *  - One-hot Warehouse/StateHoliday/Product_Category (drop_first, same as pd.get_dummies)
 *  - Product_Code target encoding (train means, global-mean fallback)
 *  - StandardScaler on [Year, Month, Day, DayOfWeek, Petrol_price, Product_Code_TargetEnc]
 *    + legacy Petrol_price_scaled (full-data scaler, cell 31)
 *  - Lasso dot product + intercept  => predicted (capped) Order_Demand
 */
export function predictDemand(input) {
  const d = new Date(input.date + 'T00:00:00')
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const dayOfWeek = (d.getDay() + 6) % 7 // Monday=0 like pandas
  const isWeekend = dayOfWeek >= 5 ? 1 : 0
  const promoOrHoliday =
    (input.promo || input.schoolHoliday || input.stateHoliday !== '0') ? 1 : 0
  const targetEnc = model.code_means[input.productCode] ?? model.global_mean

  const raw = {
    Year: year, Month: month, Day: day, DayOfWeek: dayOfWeek,
    Petrol_price: input.petrolPrice, Product_Code_TargetEnc: targetEnc
  }
  const scaled = {}
  model.scaler.columns.forEach((c, i) => {
    scaled[c] = (raw[c] - model.scaler.mean[i]) / model.scaler.scale[i]
  })
  const petrolScaled =
    (input.petrolPrice - model.scaler31.mean) / model.scaler31.scale

  const vec = {}
  for (const name of model.features) {
    if (name in scaled) vec[name] = scaled[name]
    else if (name === 'Petrol_price_scaled') vec[name] = petrolScaled
    else if (name === 'Is_Weekend') vec[name] = isWeekend
    else if (name === 'Promo_Or_Holiday') vec[name] = promoOrHoliday
    else if (name === 'Open') vec[name] = input.open ? 1 : 0
    else if (name === 'Promo') vec[name] = input.promo ? 1 : 0
    else if (name === 'SchoolHoliday') vec[name] = input.schoolHoliday ? 1 : 0
    else if (name.startsWith('Warehouse_')) vec[name] = name === 'Warehouse_' + input.warehouse ? 1 : 0
    else if (name.startsWith('StateHoliday_')) vec[name] = name === 'StateHoliday_' + input.stateHoliday ? 1 : 0
    else if (name.startsWith('Product_Category_')) vec[name] = name === 'Product_Category_' + input.category ? 1 : 0
    else vec[name] = 0
  }

  let y = model.intercept
  const contribs = []
  model.features.forEach((name, i) => {
    const c = model.coef[i] * vec[name]
    y += c
    contribs.push({ name: prettyName(name), value: c })
  })
  contribs.sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
  return { demand: Math.max(0, y), drivers: contribs.slice(0, 6) }
}

function prettyName(n) {
  return n
    .replace('Product_Code_TargetEnc', 'Product history (target-encoded)')
    .replace('Product_Category_Category_', 'Category ')
    .replace('Product_Category_', 'Category ')
    .replace('Warehouse_Whse_', 'Warehouse ')
    .replace('StateHoliday_a', 'State holiday (type A)')
    .replace('StateHoliday_b', 'State holiday (type B)')
    .replace('Petrol_price_scaled', 'Fuel price (scaled)')
    .replace('Petrol_price', 'Fuel price')
    .replace('Promo_Or_Holiday', 'Promo / holiday flag')
    .replace('Is_Weekend', 'Weekend')
    .replace('DayOfWeek', 'Day of week')
    .replace('SchoolHoliday', 'School holiday')
    .replace('Open', 'Store open')
    .replace('Promo', 'Promotion')
}

export function demandLevel(value) {
  if (value <= T.low) return { key: 'low', label: 'Low' }
  if (value <= T.moderate) return { key: 'moderate', label: 'Moderate' }
  if (value <= T.high) return { key: 'high', label: 'High' }
  return { key: 'veryhigh', label: 'Very High' }
}

export const fmt = (n) =>
  Math.round(n).toLocaleString('en-IN')

export const fmtDate = (iso) => {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export { appData, model }
