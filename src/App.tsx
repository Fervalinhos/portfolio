import { useEffect, useState } from 'react'
import { About } from './components/About'
import { Contact } from './components/Contact'
import { Contributions } from './components/Contributions'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Projects } from './components/Projects'
import { Stats } from './components/Stats'
import { config } from './config'
import { useI18n } from './lib/i18n'
import type { PortfolioData } from './types'

type State = { status: 'loading' } | { status: 'error' } | { status: 'ready'; data: PortfolioData }

export default function App() {
  const { t, l } = useI18n()
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/github.json`)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status))
        return res.json() as Promise<PortfolioData>
      })
      .then((data) => setState({ status: 'ready', data }))
      .catch(() => setState({ status: 'error' }))
  }, [])

  useEffect(() => {
    if (state.status === 'ready') document.title = `${state.data.profile.name} · ${l(config.headline)}`
  }, [state, l])

  if (state.status === 'loading') {
    return (
      <div className="loading" aria-busy="true">
        <span className="loading__spinner" />
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="loading">
        <div className="card error">
          <h1>{t('error.title')}</h1>
          <p>{t('error.text')}</p>
        </div>
      </div>
    )
  }

  const { data } = state
  return (
    <>
      {data.sample && <div className="sample-banner">{t('sample.banner')}</div>}
      <Header name={data.profile.name} hasContributions={data.contributions.length > 0} />
      <main>
        <Hero profile={data.profile} />
        <Stats stats={data.stats} />
        <About data={data} />
        <Projects projects={data.projects} />
        <Contributions items={data.contributions} />
      </main>
      <Contact data={data} />
    </>
  )
}
