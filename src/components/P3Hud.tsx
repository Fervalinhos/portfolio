import { useEffect, useState } from 'react'
import { useI18n } from '../lib/i18n'
import { moonPhase, periodOfDay, shortDate } from '../lib/p3time'

// Lua desenhada com o terminador: crescente à direita até a cheia, minguante à esquerda depois.
export function MoonPhaseIcon({ phase, size = 44 }: { phase: number; size?: number }) {
  const r = size / 2 - 2
  const c = size / 2
  const k = Math.cos(2 * Math.PI * phase)
  const waxing = phase < 0.5
  const rx = Math.abs(k) * r
  const lit = waxing
    ? `M${c} ${c - r}A${r} ${r} 0 0 1 ${c} ${c + r}A${rx} ${r} 0 0 ${k > 0 ? 0 : 1} ${c} ${c - r}Z`
    : `M${c} ${c - r}A${r} ${r} 0 0 0 ${c} ${c + r}A${rx} ${r} 0 0 ${k > 0 ? 1 : 0} ${c} ${c - r}Z`
  return (
    <svg className="moon-icon" width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={c} cy={c} r={r} className="moon-icon__dark" />
      <path d={lit} className="moon-icon__lit" />
      <circle cx={c} cy={c} r={r} className="moon-icon__ring" />
    </svg>
  )
}

// Relógio do canto da tela de Persona 3 Reload, com a data e a lua de hoje.
export function P3Hud() {
  const { lang } = useI18n()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(id)
  }, [])

  const { day, weekday } = shortDate(now, lang)
  const period = periodOfDay(now, lang)

  return (
    <div className="hud" role="img" aria-label={`${day} ${weekday}, ${period}`}>
      <div className="hud__date" aria-hidden="true">
        <span className="hud__day">{day}</span>
        <span className="hud__weekday">{weekday}</span>
      </div>
      <span className="hud__period" aria-hidden="true">
        {period}
      </span>
      <MoonPhaseIcon phase={moonPhase(now)} />
    </div>
  )
}
