import { config } from '../config'
import { useI18n } from '../lib/i18n'
import { reducedMotion } from '../lib/reducedMotion'
import { useTheme } from '../lib/theme'
import type { PortfolioData } from '../types'
import { Avatar } from './Avatar'
import { GitHubIcon, LinkedInIcon, PinIcon } from './Icons'
import BlurText from './reactbits/BlurText/BlurText'
import DotGrid from './reactbits/DotGrid/DotGrid'
import Magnet from './reactbits/Magnet/Magnet'
import RotatingText from './reactbits/RotatingText/RotatingText'
import { Reveal } from './Reveal'

const DOT_COLORS = {
  light: { base: '#dde1ea', active: '#4f46e5' },
  dark: { base: '#1e2635', active: '#818cf8' },
}

export function Hero({ profile }: { profile: PortfolioData['profile'] }) {
  const { t, l } = useI18n()
  const { theme } = useTheme()
  const { linkedin } = config.links
  const highlights = config.highlights ?? []

  return (
    <section className="hero" id="top">
      <div className="hero__bg" aria-hidden="true">
        <DotGrid
          dotSize={4}
          gap={22}
          baseColor={DOT_COLORS[theme].base}
          activeColor={DOT_COLORS[theme].active}
          proximity={120}
          shockRadius={220}
          shockStrength={4}
          resistance={750}
          returnDuration={1.5}
        />
      </div>
      <div className="container hero__inner">
        <div className="hero__text">
          <Reveal distance={20} duration={0.6}>
            <p className="hero__eyebrow">@{profile.login}</p>
          </Reveal>
          {reducedMotion ? (
            <h1 className="hero__name">{profile.name}</h1>
          ) : (
            <>
              <h1 className="sr-only">{profile.name}</h1>
              <div aria-hidden="true">
                <BlurText text={profile.name} animateBy="words" direction="top" delay={120} className="hero__name" />
              </div>
            </>
          )}
          <Reveal distance={20} delay={0.3}>
            <p className="hero__headline">{l(config.headline)}</p>
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
                    rotationInterval={2200}
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
          </Reveal>
          <Reveal distance={20} delay={0.45} className="hero__cta">
            <Magnet padding={40} magnetStrength={5}>
              <a className="button button--primary" href="#projects">
                {t('hero.cta.projects')}
              </a>
            </Magnet>
            <Magnet padding={40} magnetStrength={5}>
              <a className="button" href={profile.url} target="_blank" rel="noreferrer">
                <GitHubIcon /> GitHub
              </a>
            </Magnet>
            {linkedin && (
              <Magnet padding={40} magnetStrength={5}>
                <a className="button" href={linkedin} target="_blank" rel="noreferrer">
                  <LinkedInIcon /> LinkedIn
                </a>
              </Magnet>
            )}
          </Reveal>
        </div>
        <Reveal distance={0} scale={0.9} duration={1} delay={0.2} className="hero__avatar">
          <Avatar src={profile.avatarUrl} name={profile.name} size={240} />
        </Reveal>
      </div>
    </section>
  )
}
