import type { CSSProperties } from 'react'
import { useI18n, type MessageKey } from '../lib/i18n'
import type { PortfolioData } from '../types'
import { CountUp } from './CountUp'

export function Stats({ stats }: { stats: PortfolioData['stats'] }) {
  const { t, formatNumber } = useI18n()
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
          <div className="stat" key={key} data-reveal data-spotlight style={{ '--d': i } as CSSProperties}>
            <CountUp value={value ?? 0} format={formatNumber} />
            <span className="stat__label">{t(key)}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
