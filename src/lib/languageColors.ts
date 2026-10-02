// Cores usadas pelo GitHub (linguist) para as linguagens mais comuns.
const COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Java: '#b07219',
  Kotlin: '#A97BFF',
  'C#': '#178600',
  'C++': '#f34b7d',
  C: '#555555',
  Go: '#00ADD8',
  Rust: '#dea584',
  PHP: '#4F5D95',
  Ruby: '#701516',
  Swift: '#F05138',
  Dart: '#00B4AB',
  HTML: '#e34c26',
  CSS: '#663399',
  SCSS: '#c6538c',
  Vue: '#41b883',
  Svelte: '#ff3e00',
  Shell: '#89e051',
  Dockerfile: '#384d54',
  'Jupyter Notebook': '#DA5B0B',
  Lua: '#000080',
  R: '#198CE7',
  SQL: '#e38c00',
  PLpgSQL: '#336790',
  Markdown: '#083fa1',
  Other: '#8b949e',
}

export function languageColor(name: string): string {
  return COLORS[name] ?? '#8b949e'
}
