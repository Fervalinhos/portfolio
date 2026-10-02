import type { CSSProperties } from 'react'
import { config } from '../config'
import { useI18n } from '../lib/i18n'
import { FileIcon, GitHubIcon, GlobeIcon, LinkedInIcon, MailIcon } from './Icons'

export function SocialLinks({ githubUrl, website }: { githubUrl: string; website: string }) {
  const { t } = useI18n()
  const { linkedin, email, resume } = config.links
  const site = config.links.website || website
  const siteHref = site && !/^https?:\/\//.test(site) ? `https://${site}` : site

  return (
    <ul className="social" data-reveal style={{ '--d': 2 } as CSSProperties}>
      <li>
        <a href={githubUrl} target="_blank" rel="noreferrer">
          <GitHubIcon /> GitHub
        </a>
      </li>
      {linkedin && (
        <li>
          <a href={linkedin} target="_blank" rel="noreferrer">
            <LinkedInIcon /> LinkedIn
          </a>
        </li>
      )}
      {email && (
        <li>
          <a href={`mailto:${email}`}>
            <MailIcon /> {email}
          </a>
        </li>
      )}
      {siteHref && (
        <li>
          <a href={siteHref} target="_blank" rel="noreferrer">
            <GlobeIcon /> {site.replace(/^https?:\/\//, '').replace(/\/$/, '')}
          </a>
        </li>
      )}
      {resume && (
        <li>
          <a href={resume} target="_blank" rel="noreferrer">
            <FileIcon /> {t('hero.resume')}
          </a>
        </li>
      )}
    </ul>
  )
}
