import { useEffect, useRef, useState } from 'react'

/** Animated count-up number. */
export function CountUp({ value, format, duration = 1200 }) {
  const [display, setDisplay] = useState(0)
  const raf = useRef(null)
  useEffect(() => {
    const t0 = performance.now()
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / duration)
      const e = 1 - Math.pow(1 - p, 3)
      setDisplay(value * e)
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [value, duration])
  return <>{format ? format(display) : Math.round(display).toLocaleString('en-IN')}</>
}

/** Staggered reveal wrapper. */
export function Reveal({ children, delay = 0, className = '', style }) {
  return (
    <div className={`reveal ${className}`} style={{ '--d': `${delay}ms`, ...style }}>
      {children}
    </div>
  )
}
