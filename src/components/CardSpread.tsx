import { motion, type Transition } from 'motion/react'
import { Children, useEffect, useRef, useState, type FocusEvent, type ReactNode } from 'react'

// Leque de cards: fechado, os cards ficam empilhados como cartas na mão; ao passar o mouse
// (ou focar com o teclado) o leque se abre em arco, e o card sob o mouse sobe para a frente.

const CARD_WIDTH = 320
const SPRING: Transition = { type: 'spring', stiffness: 90, damping: 16, mass: 1 }

export function CardSpread({ children }: { children: ReactNode }) {
  const cards = Children.toArray(children)
  const list = useRef<HTMLUListElement>(null)
  const [width, setWidth] = useState(0)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<number | null>(null)

  useEffect(() => {
    const el = list.current
    if (!el) return
    const observer = new ResizeObserver(() => setWidth(el.clientWidth))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const n = cards.length
  const mid = (n - 1) / 2
  // aberto: distribui os cards na largura disponível, sem passar do tamanho do card
  const step = n > 1 ? Math.max(0, Math.min(CARD_WIDTH + 16, (width - CARD_WIDTH - 24) / (n - 1))) : 0

  const pose = (i: number) => {
    const d = i - mid
    if (!open) return { x: d * 30, y: Math.abs(d) * 12, rotate: d * 6, scale: 1 }
    if (active === i) return { x: d * step, y: -26, rotate: 0, scale: 1.04 }
    return { x: d * step, y: d * d * 4, rotate: d * 2.5, scale: 1 }
  }

  const close = () => {
    setOpen(false)
    setActive(null)
  }

  const onBlur = (event: FocusEvent<HTMLUListElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) close()
  }

  return (
    <ul
      ref={list}
      className={`spread ${open ? 'is-open' : ''}`}
      style={{ ['--card-width' as string]: `${CARD_WIDTH}px` }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={close}
      onFocus={() => setOpen(true)}
      onBlur={onBlur}
    >
      {cards.map((card, i) => (
        <motion.li
          key={i}
          className="spread__card"
          // os da direita ficam por cima, então o título (à esquerda) de cada card continua visível
          style={{ zIndex: active === i ? n + 1 : i + 1, transformOrigin: '50% 100%' }}
          initial={false}
          animate={pose(i)}
          transition={SPRING}
          onMouseEnter={() => setActive(i)}
          onFocus={() => setActive(i)}
        >
          {card}
        </motion.li>
      ))}
    </ul>
  )
}
