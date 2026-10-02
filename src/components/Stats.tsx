import { useI18n, type MessageKey } from '../lib/i18n'
import { reducedMotion } from '../lib/reducedMotion'
import { useTheme } from '../lib/theme'
import type { PortfolioData } from '../types'
import CountUp from './reactbits/CountUp/CountUp'
import Grainient from './reactbits/Grainient/Grainient'
import { Reveal } from './Reveal'

// Tons da cor de destaque do site: claro, médio e escuro (o texto branco fica legível em cima).
const SWIRL_COLORS = {
  light: ['#818cf8', '#4f46e5', '#312e81'],
  dark: ['#6366f1', '#4338ca', '#1e1b4b'],
}

export function Stats({ stats }: { stats: PortfolioData['stats'] }) {
  const { t, lang, formatNumber } = useI18n()
  const { theme } = useTheme()
  const [light, mid, dark] = SWIRL_COLORS[theme]
  const items: [MessageKey, number | null][] = [
    ['stats.repos', stats.publicRepos],
    ['stats.contributions', stats.contributionsLastYear],
    ['stats.stars', stats.stars],
    ['stats.contributed', stats.contributedRepos],
    ['stats.merged', stats.mergedPullRequests],
    ['stats.years', stats.yearsOnGitHub],
  ]
  const visible = items.filter(([, value]) => value !== null && value > 0).slice(0, 4)
  if (!visible.length) return null

  return (
    <section className="stats" aria-label="GitHub">
      <div className="container stats__grid">
        {visible.map(([key, value], i) => (
          <Reveal className="stat-reveal" key={key} delay={0.1 * i}>
            <div className="stat">
              {/* Redemoinho de cores (React Bits Grainient) dentro do card; cada card mostra outra parte dele */}
              {!reducedMotion && (
                <div className="stat__swirl" aria-hidden="true">
                  <Grainient
                    color1={light}
                    color2={mid}
                    color3={dark}
                    timeSpeed={0.2}
                    centerX={(i - 1.5) * 0.18}
                    centerY={i % 2 ? 0.08 : -0.08}
                    zoom={0.8}
                    contrast={1.25}
                    grainAmount={0.06}
                  />
                </div>
              )}
              {reducedMotion ? (
                <span className="stat__value">{formatNumber(value ?? 0)}</span>
              ) : (
                <CountUp to={value ?? 0} duration={1.5} separator={lang === 'pt' ? '.' : ','} className="stat__value" />
              )}
              <span className="stat__label">{t(key)}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
