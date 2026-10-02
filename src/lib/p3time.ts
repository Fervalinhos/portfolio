import type { Lang } from './i18n'

// Relógio do canto da tela de Persona 3 Reload: data, dia da semana, período do dia e fase da lua.

const SYNODIC_MONTH = 29.530588853
// Lua nova de referência: 6 de janeiro de 2000, 18:14 UTC.
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14)

/** Fase da lua de 0 (nova) a 1, passando por 0,5 (cheia). */
export function moonPhase(date: Date): number {
  const days = (date.getTime() - KNOWN_NEW_MOON) / 86_400_000
  return (((days / SYNODIC_MONTH) % 1) + 1) % 1
}

const PERIODS: Record<Lang, [number, string][]> = {
  pt: [
    [1, 'Hora Sombria'],
    [6, 'Madrugada'],
    [8, 'Manhã cedo'],
    [12, 'Manhã'],
    [14, 'Almoço'],
    [18, 'Tarde'],
    [24, 'Noite'],
  ],
  en: [
    [1, 'Dark Hour'],
    [6, 'Late Night'],
    [8, 'Early Morning'],
    [12, 'Morning'],
    [14, 'Lunchtime'],
    [18, 'Afternoon'],
    [24, 'Evening'],
  ],
}

/** Período do dia como no jogo; meia-noite é a Hora Sombria. */
export function periodOfDay(date: Date, lang: Lang): string {
  const hour = date.getHours()
  return PERIODS[lang].find(([until]) => hour < until)![1]
}

/** Data curta no formato do idioma (2/10 em português, 10/2 em inglês) e dia da semana abreviado. */
export function shortDate(date: Date, lang: Lang): { day: string; weekday: string } {
  const d = date.getDate()
  const m = date.getMonth() + 1
  const weekday = date
    .toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', { weekday: 'short' })
    .replace('.', '')
    .slice(0, 3)
    .toUpperCase()
  return { day: lang === 'pt' ? `${d}/${m}` : `${m}/${d}`, weekday }
}
