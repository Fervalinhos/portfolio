// Formato do arquivo public/data/github.json gerado por scripts/fetch_github_data.py

export interface LanguageShare {
  name: string
  percent: number
}

export interface Project {
  name: string
  fullName: string
  description: string
  url: string
  homepage: string
  language: string
  languages: LanguageShare[]
  topics: string[]
  stars: number
  forks: number
  isFork: boolean
  isArchived: boolean
  createdAt: string | null
  pushedAt: string | null
}

export interface Contribution {
  fullName: string
  url: string
  description: string
  language: string
  stars: number
  ownerAvatar: string
  topics: string[]
  pullRequests: number
  mergedPullRequests: number
  commits: number
}

export interface CalendarDay {
  date: string
  count: number
}

export interface PortfolioData {
  sample?: boolean
  generatedAt: string
  profile: {
    login: string
    name: string
    avatarUrl: string
    bio: string
    location: string
    company: string
    blog: string
    url: string
    followers: number
    createdAt: string | null
  }
  stats: {
    publicRepos: number
    stars: number
    forks: number
    contributedRepos: number
    mergedPullRequests: number
    yearsOnGitHub: number | null
    contributionsLastYear: number | null
  }
  languages: LanguageShare[]
  projects: Project[]
  contributions: Contribution[]
  calendar: { total: number; days: CalendarDay[] } | null
}
