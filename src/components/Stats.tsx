import { useI18n, type MessageKey } from '../lib/i18n'
import { reducedMotion } from '../lib/reducedMotion'
import { useTheme } from '../lib/theme'
import type { PortfolioData } from '../types'
import CountUp from './reactbits/CountUp/CountUp'
import Dither from './reactbits/Dither/Dither'
import { Reveal } from './Reveal'

type RGB = [number, number, number]
const rgb = (hex: string): RGB => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as RGB

// Ondas pontilhadas (dithering retrô) nos tons índigo do site: fundo escuro e onda clara.
const DITHER_COLORS: Record<'light' | 'dark', { wave: RGB; background: RGB }> = {
  light: { wave: rgb('#a5b4fc'), background: rgb('#312e81') },
  dark: { wave: rgb('#818cf8'), background: rgb('#1e1b4b') },
}

// Cada card mostra outra região das ondas, para não repetirem o mesmo desenho lado a lado.
const OFFSETS: [number, number][] = [
  [0, 0],
  [2.1, 0.6],
  [4.3, -0.4],
  [6.2, 0.9],
]

export function Stats({ stats }: { stats: PortfolioData['stats'] }) {
  const { t, lang, formatNumber } = useI18n()
  const { theme } = useTheme()
  const colors = DITHER_COLORS[theme]
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
              {/* Ondas com dithering (React Bits Dither) dentro do card; o mouse abre um "buraco" nelas */}
              {!reducedMotion && (
                <div className="stat__waves" aria-hidden="true">
                  <Dither
                    waveColor={colors.wave}
                    backgroundColor={colors.background}
                    waveSpeed={0.06}
                    waveFrequency={3}
                    waveAmplitude={0.32}
                    colorNum={5}
                    pixelSize={3}
                    mouseRadius={0.45}
                    offset={OFFSETS[i % OFFSETS.length]}
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
