import type { CSSProperties } from 'react'
import { useI18n } from '../lib/i18n'
import type { PortfolioData } from '../types'
import { SocialLinks } from './SocialLinks'

export function Contact({ data }: { data: PortfolioData }) {
  const { t, formatDate } = useI18n()
  return (
    <>
      <section className="section" id="contact">
        <div className="container contact">
          <h2 className="section__title" data-reveal>
            {t('contact.title')}
          </h2>
          <p className="section__subtitle" data-reveal style={{ '--d': 1 } as CSSProperties}>
            {t('contact.text')}
          </p>
          <SocialLinks githubUrl={data.profile.url} website={data.profile.blog} />
        </div>
      </section>
      <footer className="footer">
        <div className="container footer__inner muted">
          <span>
            © {data.generatedAt.slice(0, 4)} {data.profile.name}
          </span>
          <span>{t('footer.updated', { d: formatDate(data.generatedAt) })}</span>
          <span>{t('footer.built')}</span>
        </div>
      </footer>
    </>
  )
}
