import { motion } from 'motion/react'
import { config } from '../config'
import { useI18n } from '../lib/i18n'
import { reducedMotion } from '../lib/reducedMotion'
import { useTheme } from '../lib/theme'
import type { PortfolioData } from '../types'
import { Avatar } from './Avatar'
import { GitHubIcon, LinkedInIcon, PinIcon } from './Icons'
import { P3Hud } from './P3Hud'
import LightRays from './reactbits/LightRays/LightRays'
import RotatingText from './reactbits/RotatingText/RotatingText'

const EASE = [0.22, 1, 0.36, 1] as const

// Bolhas subindo, como na cena submersa do menu de Persona 3 Reload (posições fixas, sem sorteio no render).
const BUBBLES = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 37 + 11) % 100,
  size: 4 + ((i * 7) % 9),
  duration: 7 + ((i * 5) % 7),
  delay: -((i * 1.7) % 9),
}))

const RAYS = { dark: '#7fdcff', light: '#ffffff' }

// Entrada do conteúdo do topo ao carregar a página (não depende de rolagem).
const enter = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.7, ease: EASE },
})

export function Hero({ profile, stats }: { profile: PortfolioData['profile']; stats: PortfolioData['stats'] }) {
  const { t, l } = useI18n()
  const { theme } = useTheme()
  const { linkedin } = config.links
  const highlights = config.highlights ?? []
  const level = Math.max(1, Math.floor(Math.sqrt(stats.contributionsLastYear ?? 0)))
  const years = stats.yearsOnGitHub ?? 0

  return (
    <section className="hero" id="top">
      <div className="hero__bg" aria-hidden="true">
        <div className="hero__moon" />
        {!reducedMotion && (
          <LightRays
            raysOrigin="top-center"
            raysColor={RAYS[theme]}
            raysSpeed={0.5}
            lightSpread={1.1}
            rayLength={1.6}
            fadeDistance={1.1}
            followMouse
            mouseInfluence={0.06}
            noiseAmount={0.06}
            distortion={0.04}
            className="hero__rays"
          />
        )}
        <div className="hero__bubbles">
          {BUBBLES.map((b, i) => (
            <span
              key={i}
              style={{
                left: `${b.left}%`,
                width: b.size,
                height: b.size,
                animationDuration: `${b.duration}s`,
                animationDelay: `${b.delay}s`,
              }}
            />
          ))}
        </div>
      </div>

      <P3Hud />

      <div className="container hero__inner">
        <div className="hero__text">
          <motion.div {...enter(0)}>
            <p className="hero__eyebrow">@{profile.login}</p>
          </motion.div>
          <h1 className="hero__name" aria-label={profile.name}>
            {profile.name.split(' ').map((word, i) => (
              <motion.span
                key={i}
                className="hero__word"
                aria-hidden="true"
                initial={{ x: 120, opacity: 0, skewX: -20 }}
                animate={{ x: 0, opacity: 1, skewX: 0 }}
                transition={{ delay: 0.15 + i * 0.09, duration: 0.8, ease: EASE }}
              >
                {word}
              </motion.span>
            ))}
          </h1>
          <div className="hero__band-wrap">
            <motion.div
              className="hero__band"
              initial={{ x: '110%' }}
              animate={{ x: 0 }}
              transition={{ delay: 0.6, duration: 0.9, ease: EASE }}
            >
              <p className="hero__headline">{l(config.headline)}</p>
            </motion.div>
          </div>
          <motion.div {...enter(0.9)}>
            {highlights.length > 0 && (
              <p className="hero__stack">
                <span>{t('hero.stack')}</span>
                {reducedMotion ? (
                  <span className="hero__rotator">{highlights.join(' · ')}</span>
                ) : (
                  <RotatingText
                    texts={highlights}
                    mainClassName="hero__rotator"
                    splitLevelClassName="hero__rotator-split"
                    staggerFrom="last"
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '-120%' }}
                    staggerDuration={0.025}
                    transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                    rotationInterval={2400}
                  />
                )}
              </p>
            )}
            {profile.bio && <p className="hero__bio">{profile.bio}</p>}
            {profile.location && (
              <p className="hero__meta">
                <PinIcon /> {profile.location}
              </p>
            )}
          </motion.div>
          <motion.div {...enter(1.05)} className="hero__cta p3-menu">
            <a className="button button--primary" href="#projects">
              {t('hero.cta.projects')}
            </a>
            <a className="button" href={profile.url} target="_blank" rel="noreferrer">
              <GitHubIcon /> GitHub
            </a>
            {linkedin && (
              <a className="button" href={linkedin} target="_blank" rel="noreferrer">
                <LinkedInIcon /> LinkedIn
              </a>
            )}
          </motion.div>
        </div>

        <motion.aside
          className="status"
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.45, duration: 0.9, ease: EASE }}
        >
          <div className="status__card">
            <span className="status__lv">
              LV<b>{level}</b>
            </span>
            <div className="status__photo">
              <Avatar className="status__avatar" src={profile.avatarUrl} name={profile.name} size={200} />
            </div>
            <p className="status__name">{profile.login}</p>
            <div className="status__bar" aria-hidden="true">
              <span>HP</span>
              <span className="status__track">
                <i className="status__fill status__fill--hp" />
              </span>
            </div>
            <div className="status__bar" aria-hidden="true">
              <span>SP</span>
              <span className="status__track">
                <motion.i
                  className="status__fill status__fill--sp"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.2, duration: 1.4, ease: EASE }}
                />
              </span>
            </div>
            {years > 0 && <p className="status__note">{t(years === 1 ? 'hero.year' : 'hero.years', { n: years })}</p>}
          </div>
        </motion.aside>
      </div>
    </section>
  )
}
