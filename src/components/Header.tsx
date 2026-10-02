import { useEffect, useState } from 'react'
import { useI18n } from '../lib/i18n'
import { MoonIcon, SunIcon } from './Icons'

type Theme = 'light' | 'dark'

function currentTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

export function Header({ name, hasContributions }: { name: string; hasContributions: boolean }) {
  const { t, lang, setLang } = useI18n()
  const [theme, setTheme] = useState<Theme>(currentTheme)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // ignora
    }
  }, [theme])

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8)
      // No fim da página o contato nunca chega ao meio da tela.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) setActive('contact')
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Destaca no menu a seção que está no meio da tela.
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    for (const id of ['top', 'about', 'projects', 'contributions', 'contact']) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  const navLink = (id: string, label: string) => (
    <a href={`#${id}`} className={active === id ? 'is-active' : ''} aria-current={active === id ? 'location' : undefined}>
      {label}
    </a>
  )

  return (
    <header className={`header${scrolled ? ' header--scrolled' : ''}`}>
      <div className="container header__inner">
        <a href="#top" className="header__brand">
          <span className="header__logo" aria-hidden="true">{'</>'}</span>
          {name}
        </a>
        <nav className="header__nav" aria-label="Principal">
          {navLink('about', t('nav.about'))}
          {navLink('projects', t('nav.projects'))}
          {hasContributions && navLink('contributions', t('nav.contributions'))}
          {navLink('contact', t('nav.contact'))}
        </nav>
        <div className="header__actions">
          <div className="lang-switch" role="group" aria-label="Idioma / Language">
            {(['pt', 'en'] as const).map((code) => (
              <button
                key={code}
                type="button"
                className={lang === code ? 'is-active' : ''}
                aria-pressed={lang === code}
                onClick={() => setLang(code)}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label={t('theme.toggle')}
            title={t('theme.toggle')}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
      </div>
    </header>
  )
}
