import { useEffect, useState } from 'react'
import { prefersReducedMotion, useInView } from '../lib/motion'

const DURATION = 1400

// Conta de 0 até `value` quando aparece na tela.
export function CountUp({ value, format }: { value: number; format: (n: number) => string }) {
  const [ref, inView] = useInView<HTMLSpanElement>()
  const [shown, setShown] = useState(inView ? value : 0)

  useEffect(() => {
    if (!inView || prefersReducedMotion()) return
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION)
      setShown(Math.round(value * (1 - Math.pow(1 - p, 3))))
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, value])

  return (
    <span ref={ref} className="stat__value">
      {format(shown)}
    </span>
  )
}
