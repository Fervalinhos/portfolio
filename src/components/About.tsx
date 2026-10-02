import { config } from '../config'
import { useI18n } from '../lib/i18n'
import type { PortfolioData } from '../types'
import { Calendar } from './Calendar'
import { LanguageBar } from './LanguageBar'

export function About({ data }: { data: PortfolioData }) {
  const { t, l } = useI18n()
  return (
    <section className="section" id="about">
      <div className="container about">
        <div>
          <h2 className="section__title">{t('about.title')}</h2>
          <p className="about__text">{l(config.about)}</p>
        </div>
        {data.languages.length > 0 && (
          <div className="card">
            <h3 className="card__title">{t('about.languages')}</h3>
            <LanguageBar languages={data.languages} />
          </div>
        )}
        {data.calendar && data.calendar.days.length > 0 && (
          <div className="card about__calendar">
            <Calendar total={data.calendar.total} days={data.calendar.days} />
          </div>
        )}
      </div>
    </section>
  )
}
