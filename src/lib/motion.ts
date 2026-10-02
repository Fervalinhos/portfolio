import { useEffect, useRef, useState } from 'react'

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

function canAnimate(): boolean {
  return typeof window !== 'undefined' && 'IntersectionObserver' in window && !prefersReducedMotion()
}

/** Vira `true` (uma única vez) quando o elemento entra na tela. */
export function useInView<T extends Element>() {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(() => !canAnimate())

  useEffect(() => {
    const el = ref.current
    if (!el || inView) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true)
        observer.disconnect()
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [inView])

  return [ref, inView] as const
}

/**
 * Adiciona `is-revealed` a cada `[data-reveal]` quando ele entra na tela,
 * disparando a animação de entrada definida no CSS. Sem a classe o elemento
 * continua visível, então nada fica escondido se o JS ou o observer falharem.
 */
export function useRevealOnScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !canAnimate()) return
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed')
          observer.unobserve(entry.target)
        }
      }
    })
    document.querySelectorAll('[data-reveal]:not(.is-revealed)').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [enabled])
}

/** Brilho que segue o mouse nos elementos com `data-spotlight`. */
export function useSpotlight() {
  useEffect(() => {
    if (prefersReducedMotion()) return
    const onMove = (event: PointerEvent) => {
      const el = (event.target as Element | null)?.closest?.<HTMLElement>('[data-spotlight]')
      if (!el) return
      const rect = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${event.clientX - rect.left}px`)
      el.style.setProperty('--my', `${event.clientY - rect.top}px`)
    }
    document.addEventListener('pointermove', onMove, { passive: true })
    return () => document.removeEventListener('pointermove', onMove)
  }, [])
}
