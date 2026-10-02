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

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // ignora
    }
  }, [theme])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`header${scrolled ? ' header--scrolled' : ''}`}>
      <div className="container header__inner">
        <a href="#top" className="header__brand">
          <span className="header__logo" aria-hidden="true">{'</>'}</span>
          {name}
        </a>
        <nav className="header__nav" aria-label="Principal">
          <a href="#about">{t('nav.about')}</a>
          <a href="#projects">{t('nav.projects')}</a>
          {hasContributions && <a href="#contributions">{t('nav.contributions')}</a>}
          <a href="#contact">{t('nav.contact')}</a>
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
