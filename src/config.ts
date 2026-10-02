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
  links: {
    linkedin: string
    email: string
    website: string
    resume: string
  }
}

// Anotação (e não "as") para o TypeScript validar o JSON editado à mão.
export const config: SiteConfig = raw
