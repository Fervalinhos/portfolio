// Quem pede menos movimento no sistema vê o conteúdo direto, sem as animações.
export const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
