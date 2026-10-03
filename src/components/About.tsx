import { config } from '../config'
import { useI18n } from '../lib/i18n'
import type { PortfolioData } from '../types'
import { Calendar } from './Calendar'
import { LanguageBar } from './LanguageBar'
import { Reveal } from './Reveal'

export function About({ data }: { data: PortfolioData }) {
  const { t, l } = useI18n()
  const stack = config.stack ?? []
  return (
    <section className="section" id="about">
      <div className="container about">
        <Reveal>
          <h2 className="section__title">{t('about.title')}</h2>
          <p className="about__text">{l(config.about)}</p>
          {stack.length > 0 && (
            <dl className="stack">
              {stack.map((group) => (
                <div className="stack__group" key={group.label.en}>
                  <dt>{l(group.label)}</dt>
                  <dd>
                    <ul className="tags">
                      {group.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </Reveal>
        {data.languages.length > 0 && (
          <Reveal className="card" delay={0.15}>
            <h3 className="card__title">{t('about.languages')}</h3>
            <LanguageBar languages={data.languages} />
          </Reveal>
        )}
        {data.calendar && data.calendar.days.length > 0 && (
          <Reveal className="card about__calendar">
            <Calendar total={data.calendar.total} days={data.calendar.days} />
          </Reveal>
        )}
      </div>
    </section>
  )
}
