import { Children, useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { useI18n } from '../lib/i18n'
import { reducedMotion } from '../lib/reducedMotion'
import { ChevronLeftIcon, ChevronRightIcon } from './Icons'

// Distância entre o início de um card e o do próximo (largura + espaçamento).
function slideStep(el: HTMLElement | null): number {
  const [first, second] = el ? (Array.from(el.children) as HTMLElement[]) : []
  if (!first) return 0
  return second ? second.offsetLeft - first.offsetLeft : first.offsetWidth
}

// Carrossel com rolagem nativa (arrasta no celular e no trackpad) e encaixe em cada card.
// As setas e os indicadores rolam um card por vez.
export function Carousel({ children }: { children: ReactNode }) {
  const { t } = useI18n()
  const track = useRef<HTMLDivElement>(null)
  const slides = Children.toArray(children)
  const [index, setIndex] = useState(0)
  const [positions, setPositions] = useState(1)

  const measure = useCallback(() => {
    const el = track.current
    const size = slideStep(el)
    if (!el || !size) return
    const perView = Math.max(1, Math.round(el.clientWidth / size))
    const last = Math.max(0, slides.length - perView)
    const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 2
    setPositions(last + 1)
    setIndex(atEnd ? last : Math.min(last, Math.round(el.scrollLeft / size)))
  }, [slides.length])

  useEffect(() => {
    const el = track.current
    if (!el) return
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    el.addEventListener('scroll', measure, { passive: true })
    return () => {
      observer.disconnect()
      el.removeEventListener('scroll', measure)
    }
  }, [measure])

  const goTo = (i: number) => {
    const target = Math.max(0, Math.min(positions - 1, i))
    track.current?.scrollTo({ left: target * slideStep(track.current), behavior: reducedMotion ? 'auto' : 'smooth' })
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    goTo(index + (event.key === 'ArrowRight' ? 1 : -1))
  }

  return (
    <div className="carousel">
      <div
        ref={track}
        className="carousel__track"
        role="region"
        aria-roledescription="carousel"
        aria-label={t('projects.carousel')}
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        {slides.map((slide, i) => (
          <div className="carousel__slide" role="group" aria-roledescription="slide" aria-label={t('projects.slide', { i: i + 1, n: slides.length })} key={i}>
            {slide}
          </div>
        ))}
      </div>
      {positions > 1 && (
        <div className="carousel__controls">
          <div className="carousel__dots">
            {Array.from({ length: positions }, (_, i) => (
              <button
                type="button"
                key={i}
                className={i === index ? 'is-active' : ''}
                aria-label={t('projects.goTo', { i: i + 1 })}
                aria-current={i === index}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
          <div className="carousel__arrows">
            <button type="button" className="icon-button" aria-label={t('projects.prev')} disabled={index === 0} onClick={() => goTo(index - 1)}>
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              className="icon-button"
              aria-label={t('projects.next')}
              disabled={index >= positions - 1}
              onClick={() => goTo(index + 1)}
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
