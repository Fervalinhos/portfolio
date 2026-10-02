# React Bits

Componentes copiados de [React Bits](https://reactbits.dev) (variante TS + CSS),
commit `e1bbb69` de 2026-09-30. Licença em [LICENSE.md](LICENSE.md).

Alterações locais: removida a diretiva `'use client'` (não se aplica ao Vite).
No `ElectricBorder`, o tamanho do canvas usa `offsetWidth`/`offsetHeight` em vez de
`getBoundingClientRect()`, para não encolher quando o elemento entra com animação de escala.
No `LiquidEther`, com `lightMode` a cor do fluido não é misturada com preto (sobre fundo claro
ela ficava acinzentada).
Ajustes de cor e layout ficam em `src/styles.css`, para facilitar atualizar estes arquivos.
