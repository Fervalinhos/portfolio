# React Bits

Componentes copiados de [React Bits](https://reactbits.dev) (variante TS + CSS),
commit `e1bbb69` de 2026-09-30. Licença em [LICENSE.md](LICENSE.md).

Alterações locais: removida a diretiva `'use client'` (não se aplica ao Vite).
No `ElectricBorder`, o tamanho do canvas usa `offsetWidth`/`offsetHeight` em vez de
`getBoundingClientRect()`, para não encolher quando o elemento entra com animação de escala.
O `Dither` foi portado para `ogl`: os mesmos shaders (ondas e dithering Bayer 8x8) num único
passe, sem three.js e react-three-fiber, para rodar um por card. Ganhou a prop `offset`, que
desloca o campo de ondas para cada card mostrar uma parte diferente, e a prop `smooth`, que
desenha as mesmas ondas lisas, sem pixelização nem dithering, na escala de `renderScale`.
Desempenho: o `DotGrid` só redesenha quando o mouse mexe ou algum ponto ainda está voltando
(e desenha os pontos parados num único `fill`), e o `DotGrid` e o `ElectricBorder` pausam fora
da tela; no original os dois redesenhavam a cada quadro o tempo todo.
Ajustes de cor e layout ficam em `src/styles.css`, para facilitar atualizar estes arquivos.
