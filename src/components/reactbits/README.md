# React Bits

Componentes copiados de [React Bits](https://reactbits.dev) (variante TS + CSS),
commit `e1bbb69` de 2026-09-30. Licença em [LICENSE.md](LICENSE.md).

Alterações locais: removida a diretiva `'use client'` (não se aplica ao Vite).
No `ElectricBorder`, o tamanho do canvas usa `offsetWidth`/`offsetHeight` em vez de
`getBoundingClientRect()`, para não encolher quando o elemento entra com animação de escala.
O `Dither` foi portado para `ogl`: os mesmos shaders (ondas e dithering Bayer 8x8) num único
passe, sem three.js e react-three-fiber, para rodar um por card. Ganhou a prop `offset`, que
desloca o campo de ondas para cada card mostrar uma parte diferente.
Ajustes de cor e layout ficam em `src/styles.css`, para facilitar atualizar estes arquivos.
