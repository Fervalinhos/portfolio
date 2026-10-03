import { useMemo, useState } from 'react'
import { useI18n } from '../lib/i18n'
import { languageColor } from '../lib/languageColors'
import { reducedMotion } from '../lib/reducedMotion'
import { useMediaQuery } from '../lib/useMediaQuery'
import type { Project } from '../types'
import { CardSpread } from './CardSpread'
import { Carousel } from './Carousel'
import { ExternalIcon, ForkIcon, GitHubIcon, StarIcon } from './Icons'
import { LanguageBar } from './LanguageBar'
import { P3Card, P3Title } from './P3Card'
import { Reveal } from './Reveal'

function prettyName(name: string): string {
  return name.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function ProjectCard({ project }: { project: Project }) {
  const { t, formatDate } = useI18n()
  const demo = project.homepage && !/^https?:\/\//.test(project.homepage) ? `https://${project.homepage}` : project.homepage

  return (
    <P3Card className="project">
      <div className="project__head">
        <P3Title className="project__name">
          <a href={project.url} target="_blank" rel="noreferrer">
            {prettyName(project.name)}
          </a>
        </P3Title>
        {project.isArchived && <span className="badge">{t('projects.archived')}</span>}
      </div>
      {project.description && <p className="project__desc">{project.description}</p>}
      {project.topics.length > 0 && (
        <ul className="tags">
          {project.topics.slice(0, 6).map((topic) => (
            <li key={topic}>{topic}</li>
          ))}
        </ul>
      )}
      <div className="project__spacer" />
      <LanguageBar languages={project.languages} compact />
      <div className="project__meta">
        {project.language && (
          <span>
            <span className="dot" style={{ background: languageColor(project.language) }} />
            {project.language}
          </span>
        )}
        {project.stars > 0 && (
          <span title="Stars">
            <StarIcon /> {project.stars}
          </span>
        )}
        {project.forks > 0 && (
          <span title="Forks">
            <ForkIcon /> {project.forks}
          </span>
        )}
        {project.pushedAt && <span className="muted">{t('projects.updated', { d: formatDate(project.pushedAt) })}</span>}
      </div>
      <div className="project__links">
        <a className="button button--small" href={project.url} target="_blank" rel="noreferrer">
          <GitHubIcon /> {t('projects.code')}
        </a>
        {demo && (
          <a className="button button--small button--primary" href={demo} target="_blank" rel="noreferrer">
            <ExternalIcon /> {t('projects.demo')}
          </a>
        )}
      </div>
    </P3Card>
  )
}

// Quantos projetos (os mais relevantes) aparecem em destaque antes de abrir a lista completa.
const FEATURED_SIZE = 6

export function Projects({ projects }: { projects: Project[] }) {
  const { t } = useI18n()
  const [filter, setFilter] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  // Telas largas: leque de cards; no celular e tablet estreito, carrossel com rolagem.
  const wide = useMediaQuery('(min-width: 1000px)')

  const languages = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of projects) if (p.language) counts.set(p.language, (counts.get(p.language) ?? 0) + 1)
    return [...counts.entries()].sort((a, b) => b[1] - a[1])
  }, [projects])

  const visible = filter ? projects.filter((p) => p.language === filter) : projects
  const featured = projects.slice(0, FEATURED_SIZE)
  // Com poucos projetos o carrossel não ajuda: a lista aparece direto.
  const hasCarousel = projects.length > 3
  const listOpen = showAll || !hasCarousel

  const toggle = () => {
    setShowAll(!showAll)
    if (showAll) document.getElementById('projects')?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })
  }

  return (
    <section className="section" id="projects">
      <div className="container">
        <Reveal>
          <h2 className="section__title">{t('projects.title')}</h2>
          <p className="section__subtitle">{t('projects.subtitle')}</p>
        </Reveal>
        {!listOpen && (
          <Reveal direction="horizontal" distance={60} duration={1.1} delay={0.1}>
            {wide ? (
              <>
                <CardSpread>
                  {featured.map((project) => (
                    <ProjectCard project={project} key={project.fullName} />
                  ))}
                </CardSpread>
                <p className="spread__hint">{t('projects.spreadHint')}</p>
              </>
            ) : (
              <Carousel>
                {featured.map((project) => (
                  <ProjectCard project={project} key={project.fullName} />
                ))}
              </Carousel>
            )}
          </Reveal>
        )}
        {listOpen && languages.length > 1 && (
          <Reveal className="chips" role="group" aria-label="Filtro" delay={0.1}>
            <button type="button" className={filter === null ? 'is-active' : ''} aria-pressed={filter === null} onClick={() => setFilter(null)}>
              {t('projects.all')} <span className="muted">{projects.length}</span>
            </button>
            {languages.map(([lang, count]) => (
              <button
                type="button"
                key={lang}
                className={filter === lang ? 'is-active' : ''}
                aria-pressed={filter === lang}
                onClick={() => setFilter(lang)}
              >
                <span className="dot" style={{ background: languageColor(lang) }} />
                {lang} <span className="muted">{count}</span>
              </button>
            ))}
          </Reveal>
        )}
        {listOpen &&
          (visible.length ? (
            <div className="grid" key={filter ?? 'all'}>
              {visible.map((project, i) => (
                <Reveal key={project.fullName} direction="horizontal" distance={60} duration={1.1} delay={(i % 3) * 0.15}>
                  <ProjectCard project={project} />
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="muted">{t('projects.empty')}</p>
          ))}
        {hasCarousel && (
          <div className="projects__more">
            <button type="button" className="button" aria-expanded={showAll} onClick={toggle}>
              {showAll ? t('projects.showLess') : t('projects.showAll', { n: projects.length })}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
