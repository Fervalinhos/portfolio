import type { ComponentProps } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { reducedMotion } from '../lib/reducedMotion'
import AnimatedContent from './reactbits/AnimatedContent/AnimatedContent'

// Os títulos usam fonte da web: quando ela carrega o layout muda, então os gatilhos de rolagem são recalculados.
if (typeof document !== 'undefined') void document.fonts?.ready.then(() => ScrollTrigger.refresh())

type RevealProps = ComponentProps<typeof AnimatedContent>

// Entrada ao rolar (React Bits AnimatedContent), desligada para quem prefere menos movimento.
export function Reveal({ children, className, style, ...options }: RevealProps) {
  if (reducedMotion) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    )
  }
  return (
    <AnimatedContent distance={40} duration={0.9} ease="power3.out" threshold={0.12} className={className} style={style} {...options}>
      {children}
    </AnimatedContent>
  )
}
