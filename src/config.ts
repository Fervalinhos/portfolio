import raw from '../portfolio.config.json'

export interface Localized {
  pt: string
  en: string
}

export interface SiteConfig {
  githubUser: string
  name: string
  headline: Localized
  about: Localized
  /** Tecnologias que giram no topo do site */
  highlights?: string[]
  /** Stack por área, exibida em "Sobre mim" */
  stack?: { label: Localized; items: string[] }[]
  links: {
    linkedin: string
    email: string
    website: string
    resume: string
  }
}

// Anotação (e não "as") para o TypeScript validar o JSON editado à mão.
export const config: SiteConfig = raw
