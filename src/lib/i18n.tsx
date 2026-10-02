import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Localized } from '../config'

export type Lang = 'pt' | 'en'

const messages = {
  pt: {
    'nav.about': 'Sobre',
    'nav.projects': 'Projetos',
    'nav.contributions': 'Contribuições',
    'nav.contact': 'Contato',
    'hero.cta.projects': 'Ver projetos',
    'hero.cta.contact': 'Fale comigo',
    'hero.resume': 'Currículo',
    'stats.repos': 'Repositórios públicos',
    'stats.stars': 'Estrelas recebidas',
    'stats.contributed': 'Repositórios em que contribuí',
    'stats.merged': 'Pull requests aceitos',
    'stats.contributions': 'Contribuições no último ano',
    'stats.years': 'Anos no GitHub',
    'about.title': 'Sobre mim',
    'about.languages': 'Tecnologias mais usadas',
    'calendar.title': 'Atividade no último ano',
    'calendar.total': '{n} contribuições',
    'calendar.less': 'Menos',
    'calendar.more': 'Mais',
    'projects.title': 'Projetos em destaque',
    'projects.subtitle': 'Repositórios que criei, selecionados por relevância.',
    'projects.all': 'Todos',
    'projects.code': 'Código',
    'projects.demo': 'Demo',
    'projects.updated': 'Atualizado em {d}',
    'projects.archived': 'Arquivado',
    'projects.empty': 'Nenhum projeto com essa linguagem.',
    'contrib.title': 'Contribuições open source',
    'contrib.subtitle': 'Projetos de outras pessoas e organizações em que participei.',
    'contrib.prs': '{n} PRs aceitos',
    'contrib.prsOpen': '{n} PRs',
    'contrib.commits': '{n} commits',
    'contact.title': 'Vamos conversar?',
    'contact.text': 'Estou aberto a oportunidades, projetos e colaborações. Me chame por qualquer um dos canais abaixo.',
    'footer.updated': 'Dados do GitHub atualizados em {d}',
    'footer.built': 'Feito com React, TypeScript e Python',
    'sample.banner': 'Mostrando dados de exemplo. Rode "npm run data" para gerar os seus.',
    'error.title': 'Não foi possível carregar os dados',
    'error.text': 'Gere o arquivo de dados com "npm run data" (ou "npm run data:sample" para um exemplo).',
    'theme.toggle': 'Alternar tema',
  },
  en: {
    'nav.about': 'About',
    'nav.projects': 'Projects',
    'nav.contributions': 'Contributions',
    'nav.contact': 'Contact',
    'hero.cta.projects': 'View projects',
    'hero.cta.contact': 'Get in touch',
    'hero.resume': 'Résumé',
    'stats.repos': 'Public repositories',
    'stats.stars': 'Stars earned',
    'stats.contributed': 'Repositories contributed to',
    'stats.merged': 'Merged pull requests',
    'stats.contributions': 'Contributions last year',
    'stats.years': 'Years on GitHub',
    'about.title': 'About me',
    'about.languages': 'Most used technologies',
    'calendar.title': 'Activity in the last year',
    'calendar.total': '{n} contributions',
    'calendar.less': 'Less',
    'calendar.more': 'More',
    'projects.title': 'Featured projects',
    'projects.subtitle': 'Repositories I built, ranked by relevance.',
    'projects.all': 'All',
    'projects.code': 'Code',
    'projects.demo': 'Live demo',
    'projects.updated': 'Updated {d}',
    'projects.archived': 'Archived',
    'projects.empty': 'No projects in this language.',
    'contrib.title': 'Open source contributions',
    'contrib.subtitle': "Projects by other people and organizations I've worked on.",
    'contrib.prs': '{n} merged PRs',
    'contrib.prsOpen': '{n} PRs',
    'contrib.commits': '{n} commits',
    'contact.title': "Let's talk",
    'contact.text': "I'm open to opportunities, projects and collaborations. Reach out through any of the channels below.",
    'footer.updated': 'GitHub data updated on {d}',
    'footer.built': 'Built with React, TypeScript and Python',
    'sample.banner': 'Showing sample data. Run "npm run data" to generate yours.',
    'error.title': 'Could not load the data',
    'error.text': 'Generate the data file with "npm run data" (or "npm run data:sample" for an example).',
    'theme.toggle': 'Toggle theme',
  },
} as const

export type MessageKey = keyof (typeof messages)['pt']

interface I18n {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: MessageKey, vars?: Record<string, string | number>) => string
  l: (value: Localized) => string
  formatDate: (iso: string) => string
  formatNumber: (n: number) => string
}

const I18nContext = createContext<I18n | null>(null)

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem('lang')
    if (saved === 'pt' || saved === 'en') return saved
  } catch {
    // localStorage indisponível (modo privado etc.)
  }
  return navigator.language.toLowerCase().startsWith('pt') ? 'pt' : 'en'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  useEffect(() => {
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en'
  }, [lang])

  const value = useMemo<I18n>(() => {
    const locale = lang === 'pt' ? 'pt-BR' : 'en-US'
    return {
      lang,
      setLang: (next) => {
        setLangState(next)
        try {
          localStorage.setItem('lang', next)
        } catch {
          // ignora
        }
      },
      t: (key, vars) =>
        Object.entries(vars ?? {}).reduce<string>(
          (text, [name, v]) => text.replace(`{${name}}`, String(v)),
          messages[lang][key],
        ),
      l: (value) => value[lang] || value.pt || value.en,
      formatDate: (iso) =>
        new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' }),
      formatNumber: (n) => n.toLocaleString(locale),
    }
  }, [lang])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

// eslint-disable-next-line react/only-export-components
export function useI18n(): I18n {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n precisa estar dentro de <I18nProvider>')
  return ctx
}
