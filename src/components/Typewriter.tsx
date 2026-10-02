import { useEffect, useState } from 'react'
import { prefersReducedMotion } from '../lib/motion'

// Digita o texto uma vez. Use `key={text}` no pai para redigitar quando o texto mudar.
export function Typewriter({ text, speed = 45 }: { text: string; speed?: number }) {
  const [count, setCount] = useState(() => (prefersReducedMotion() ? text.length : 0))

  useEffect(() => {
    if (count >= text.length) return
    const id = window.setTimeout(() => setCount((c) => c + 1), count === 0 ? 500 : speed)
    return () => window.clearTimeout(id)
  }, [count, text, speed])

  return (
    <span className="typewriter">
      <span className="sr-only">{text}</span>
      <span className="typewriter__ghost" aria-hidden="true">
        {text}
      </span>
      <span className="typewriter__live" aria-hidden="true">
        {text.slice(0, count)}
        <span className="typewriter__caret" />
      </span>
    </span>
  )
}
