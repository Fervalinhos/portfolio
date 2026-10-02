import { useI18n } from '../lib/i18n'
import { languageColor } from '../lib/languageColors'
import type { Contribution } from '../types'
import { Avatar } from './Avatar'
import { CommitIcon, PullRequestIcon, StarIcon } from './Icons'
import { P3Card, P3Title } from './P3Card'
import { Reveal } from './Reveal'

export function Contributions({ items }: { items: Contribution[] }) {
  const { t, formatNumber } = useI18n()
  if (!items.length) return null

  return (
    <section className="section section--alt" id="contributions">
      <div className="container">
        <Reveal>
          <h2 className="section__title">{t('contrib.title')}</h2>
          <p className="section__subtitle">{t('contrib.subtitle')}</p>
        </Reveal>
        <div className="grid grid--wide">
          {items.map((item, i) => (
            <Reveal key={item.fullName} direction="horizontal" distance={60} duration={1.1} delay={(i % 2) * 0.15}>
              <P3Card className="contrib-card">
                <a className="contrib" href={item.url} target="_blank" rel="noreferrer">
                  <Avatar className="contrib__avatar" src={item.ownerAvatar} name={item.fullName.split('/')[0]} size={44} />
                  <div className="contrib__body">
                    <P3Title className="contrib__name">
                      <span className="muted">{item.fullName.split('/')[0]}/</span>
                      {item.fullName.split('/')[1]}
                    </P3Title>
                    {item.description && <p className="contrib__desc">{item.description}</p>}
                    <div className="project__meta">
                      {item.language && (
                        <span>
                          <span className="dot" style={{ background: languageColor(item.language) }} />
                          {item.language}
                        </span>
                      )}
                      {item.stars > 0 && (
                        <span>
                          <StarIcon /> {formatNumber(item.stars)}
                        </span>
                      )}
                      {item.mergedPullRequests > 0 ? (
                        <span className="contrib__pill">
                          <PullRequestIcon /> {t('contrib.prs', { n: item.mergedPullRequests })}
                        </span>
                      ) : item.pullRequests > 0 ? (
                        <span className="contrib__pill">
                          <PullRequestIcon /> {t('contrib.prsOpen', { n: item.pullRequests })}
                        </span>
                      ) : null}
                      {item.commits > 0 && (
                        <span className="contrib__pill">
                          <CommitIcon /> {t('contrib.commits', { n: item.commits })}
                        </span>
                      )}
                    </div>
                  </div>
                </a>
              </P3Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
