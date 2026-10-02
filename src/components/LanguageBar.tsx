import { languageColor } from '../lib/languageColors'
import type { LanguageShare } from '../types'

export function LanguageBar({ languages, compact = false }: { languages: LanguageShare[]; compact?: boolean }) {
  if (!languages.length) return null
  return (
    <div className={`langbar${compact ? ' langbar--compact' : ''}`}>
      <div className="langbar__track" role="img" aria-label={languages.map((l) => `${l.name} ${l.percent}%`).join(', ')}>
        {languages.map((lang) => (
          <span key={lang.name} style={{ width: `${lang.percent}%`, background: languageColor(lang.name) }} />
        ))}
      </div>
      {!compact && (
        <ul className="langbar__legend">
          {languages.map((lang) => (
            <li key={lang.name}>
              <span className="dot" style={{ background: languageColor(lang.name) }} />
              {lang.name} <span className="muted">{lang.percent}%</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
