import { useEffect, useRef } from 'react'
import { useI18n } from '../lib/i18n'
import type { CalendarDay } from '../types'

function levels(days: CalendarDay[]): (count: number) => number {
  const counts = days.map((d) => d.count).filter((c) => c > 0).sort((a, b) => a - b)
  if (!counts.length) return () => 0
  const q = (p: number) => counts[Math.min(counts.length - 1, Math.floor(p * counts.length))]
  const [q1, q2, q3] = [q(0.25), q(0.5), q(0.75)]
  return (count) => (count === 0 ? 0 : count <= q1 ? 1 : count <= q2 ? 2 : count <= q3 ? 3 : 4)
}

export function Calendar({ total, days }: { total: number; days: CalendarDay[] }) {
  const { t, formatNumber, formatDate } = useI18n()
  const scroller = useRef<HTMLDivElement>(null)
  const level = levels(days)

  // Em telas pequenas mostra primeiro as semanas mais recentes.
  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [])

  // Alinha a primeira coluna no domingo, como no GitHub.
  const offset = days.length ? new Date(`${days[0].date}T00:00:00`).getDay() : 0

  return (
    <div className="calendar">
      <div className="calendar__head">
        <h3>{t('calendar.title')}</h3>
        <span className="muted">{t('calendar.total', { n: formatNumber(total) })}</span>
      </div>
      <div className="calendar__scroll" ref={scroller}>
        <div className="calendar__grid">
          {Array.from({ length: offset }, (_, i) => (
            <span key={`pad-${i}`} className="calendar__cell calendar__cell--empty" />
          ))}
          {days.map((day) => (
            <span
              key={day.date}
              className={`calendar__cell lvl-${level(day.count)}`}
              title={`${formatDate(day.date + 'T12:00:00')}: ${day.count}`}
            />
          ))}
        </div>
      </div>
      <div className="calendar__legend muted">
        {t('calendar.less')}
        {[0, 1, 2, 3, 4].map((n) => (
          <span key={n} className={`calendar__cell lvl-${n}`} />
        ))}
        {t('calendar.more')}
      </div>
    </div>
  )
}
