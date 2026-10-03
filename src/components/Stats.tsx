import { useI18n, type MessageKey } from '../lib/i18n'
import { reducedMotion } from '../lib/reducedMotion'
import type { PortfolioData } from '../types'
import CountUp from './reactbits/CountUp/CountUp'
import Dither from './reactbits/Dither/Dither'
import { Reveal } from './Reveal'

type RGB = [number, number, number]
const rgb = (hex: string): RGB => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as RGB

// Ondas no azul do site (#3751e4), iguais nos dois temas: um tom mais fundo e um mais claro.
const WAVE_COLOR = rgb('#6b8cff')
const WAVE_BACKGROUND = rgb('#1f33b0')
// As ondas são um degradê suave: desenhar em meia resolução e esticar não muda o visual e custa 4x menos.
const RENDER_SCALE = 0.5

// Cada card mostra outra região das ondas, para não repetirem o mesmo desenho lado a lado.
const OFFSETS: [number, number][] = [
  [0, 0],
  [2.1, 0.6],
  [4.3, -0.4],
  [6.2, 0.9],
]

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
          <Reveal className="stat-reveal" key={key} delay={0.1 * i}>
            <div className="stat">
              {/* Ondas do React Bits Dither, lisas, dentro do card; o mouse abre um "buraco" nelas */}
              {!reducedMotion && (
                <div className="stat__waves" aria-hidden="true">
                  <Dither
                    waveColor={WAVE_COLOR}
                    backgroundColor={WAVE_BACKGROUND}
                    waveSpeed={0.06}
                    waveFrequency={1.6}
                    waveAmplitude={0.3}
                    smooth
                    renderScale={RENDER_SCALE}
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
