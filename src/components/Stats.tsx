import { lazy, Suspense } from 'react'
import { useI18n, type MessageKey } from '../lib/i18n'
import { reducedMotion } from '../lib/reducedMotion'
import { useTheme } from '../lib/theme'
import type { PortfolioData } from '../types'
import CountUp from './reactbits/CountUp/CountUp'
import { Reveal } from './Reveal'

// O fluido usa three.js, então só é baixado depois que a página abre.
const LiquidEther = lazy(() => import('./reactbits/LiquidEther/LiquidEther'))

// Tons da cor de destaque do site, do mais calmo ao mais intenso.
const FLUID_COLORS = {
  light: ['#c7d2fe', '#818cf8', '#4f46e5'],
  dark: ['#312e81', '#6366f1', '#a5b4fc'],
}

export function Stats({ stats }: { stats: PortfolioData['stats'] }) {
  const { t, lang, formatNumber } = useI18n()
  const { theme } = useTheme()
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
      <div className="container stats__inner">
        {/* Fluido atrás dos cards de vidro: segue o mouse (ou o dedo) e se mexe sozinho quando parado */}
        {!reducedMotion && (
          <div className="stats__fluid" aria-hidden="true">
            <Suspense fallback={null}>
              <LiquidEther
                key={theme}
                colors={FLUID_COLORS[theme]}
                lightMode={theme === 'light'}
                mouseForce={18}
                cursorSize={90}
                resolution={0.4}
                iterationsPoisson={24}
                iterationsViscous={24}
                autoSpeed={0.35}
                autoIntensity={1.8}
                autoResumeDelay={1500}
              />
            </Suspense>
          </div>
        )}
        <div className="stats__grid">
          {visible.map(([key, value], i) => (
            <Reveal className="stat" key={key} delay={0.1 * i}>
              {reducedMotion ? (
                <span className="stat__value">{formatNumber(value ?? 0)}</span>
              ) : (
                <CountUp to={value ?? 0} duration={1.5} separator={lang === 'pt' ? '.' : ','} className="stat__value" />
              )}
              <span className="stat__label">{t(key)}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
