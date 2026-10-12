import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from './icons.jsx'
import { appData } from '../lib/predict.js'

const PAGE = 120

/** Searchable product dropdown: type to filter, or open and pick. */
export default function ProductCombo({ value, onChange, placeholder, required }) {
  const [open, setOpen] = useState(false)
  const [hi, setHi] = useState(0)
  const [browseAll, setBrowseAll] = useState(false)
  const listRef = useRef(null)

  const q = value.trim().toLowerCase()
  const filtered = useMemo(
    () => (browseAll || !q ? appData.products : appData.products.filter((p) => p.toLowerCase().includes(q))),
    [q, browseAll]
  )
  const shown = filtered.slice(0, PAGE)

  useEffect(() => {
    setHi(0)
  }, [q])

  useEffect(() => {
    if (!open || !listRef.current) return
    listRef.current.querySelector(`[data-i="${hi}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [hi, open])

  const pick = (p) => {
    onChange(p)
    setOpen(false)
    setBrowseAll(false)
  }

  const toggleBrowse = () => {
    setBrowseAll(true)
    setOpen((o) => !o)
  }

  const onKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setHi((h) => Math.min(h + 1, shown.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHi((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter' && open && shown[hi]) {
      e.preventDefault()
      pick(shown[hi])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const meta = (p) => {
    const pr = appData.product_profiles[p]
    if (!pr) return ''
    return `${pr.warehouse.replace('Whse_', 'Whse ')} · ${pr.category.replace('Category_', 'Cat ')}`
  }

  return (
    <div className="combo">
      <div className="search-wrap">
        <Icon name="search" size={16} />
        <input
          value={value}
          onChange={(e) => { onChange(e.target.value); setBrowseAll(false); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          required={required}
        />
        <button type="button" className="combo-chev" onClick={toggleBrowse} aria-label="Browse products" tabIndex={-1}>
          <Icon name="chevronDown" size={16} />
        </button>
      </div>
      {open && (
        <>
          <div className="menu-veil" onClick={() => setOpen(false)} />
          <div className="combo-list" ref={listRef}>
            <div className="combo-count">
              {filtered.length === 0
                ? 'No products match'
                : `${filtered.length.toLocaleString('en-IN')} product${filtered.length === 1 ? '' : 's'}`}
            </div>
            {shown.map((p, i) => (
              <button
                key={p}
                type="button"
                data-i={i}
                className={'combo-item' + (i === hi ? ' hi' : '') + (p === value ? ' sel' : '')}
                onMouseEnter={() => setHi(i)}
                onClick={() => pick(p)}
              >
                <span className="combo-code">{p.replace('Product_', 'Product ')}</span>
                <span className="combo-meta">{meta(p)}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
