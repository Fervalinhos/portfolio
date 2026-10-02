import { useState } from 'react'

function initials(name: string): string {
  const parts = name.replace(/[^\p{L}\p{N}\s]/gu, ' ').trim().split(/\s+/)
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || '?'
}

// Imagem com fallback para as iniciais caso o avatar não carregue.
export function Avatar({ src, name, size, className }: { src: string; name: string; size: number; className?: string }) {
  const [failed, setFailed] = useState(false)
  const url = `${src}${src.includes('?') ? '&' : '?'}s=${size * 2}`

  if (failed || !src) {
    return (
      <span className={`avatar-fallback ${className ?? ''}`} role="img" aria-label={name}>
        {initials(name)}
      </span>
    )
  }
  return <img className={className} src={url} alt={name} width={size} height={size} loading="lazy" onError={() => setFailed(true)} />
}
