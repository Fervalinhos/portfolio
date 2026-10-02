import { useI18n, type MessageKey } from '../lib/i18n'
import { reducedMotion } from '../lib/reducedMotion'
import type { PortfolioData } from '../types'
import CountUp from './reactbits/CountUp/CountUp'
import { Reveal } from './Reveal'

export function Stats({ stats }: { stats: PortfolioData['stats'] }) {
  const { t, lang, formatNumber } = useI18n()
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
    </section>
  )
}
