import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// No GitHub Pages o site fica em https://<usuario>.github.io/<repo>/,
// então o workflow informa o caminho base via BASE_PATH.
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  build: {
    // SINGLE_BUNDLE=1 junta os imports dinâmicos num só arquivo, para prévias que
    // precisam embutir o JS no HTML. O build normal baixa o fluido (three.js) à parte.
    rolldownOptions: process.env.SINGLE_BUNDLE ? { output: { inlineDynamicImports: true } } : {},
  },
})
