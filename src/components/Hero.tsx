import { config } from '../config'
import { useI18n } from '../lib/i18n'
import type { PortfolioData } from '../types'
import { Avatar } from './Avatar'
import { GitHubIcon, LinkedInIcon, PinIcon } from './Icons'

export function Hero({ profile }: { profile: PortfolioData['profile'] }) {
  const { t, l } = useI18n()
  const { linkedin } = config.links

  return (
    <section className="hero" id="top">
      <div className="container hero__inner">
        <div className="hero__text">
          <p className="hero__eyebrow">@{profile.login}</p>
          <h1 className="hero__name">{profile.name}</h1>
          <p className="hero__headline">{l(config.headline)}</p>
          {profile.bio && <p className="hero__bio">{profile.bio}</p>}
          {profile.location && (
            <p className="hero__meta">
              <PinIcon /> {profile.location}
            </p>
          )}
          <div className="hero__cta">
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
          </div>
        </div>
        <div className="hero__avatar">
          <Avatar src={profile.avatarUrl} name={profile.name} size={240} />
        </div>
      </div>
    </section>
  )
}
