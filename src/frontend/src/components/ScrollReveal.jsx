import { useEffect, useRef } from 'react'

/** Fades in when scrolled into view. */
export default function ScrollReveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transitionDelay = `${delay}ms`
          el.classList.add('in')
          io.disconnect()
        }
      },
      { threshold: 0.12 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [delay])
  return <div ref={ref} className={`scroll-reveal ${className}`}>{children}</div>
}
