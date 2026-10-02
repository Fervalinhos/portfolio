import type { ComponentProps } from 'react'
import { reducedMotion } from '../lib/reducedMotion'
import AnimatedContent from './reactbits/AnimatedContent/AnimatedContent'

type RevealProps = ComponentProps<typeof AnimatedContent>

// Atributos de HTML (role, aria-*, data-*, id) que precisam chegar à div também sem animação.
const isDomProp = (key: string) => key === 'role' || key === 'id' || key.startsWith('aria-') || key.startsWith('data-')

// Entrada ao rolar (React Bits AnimatedContent), desligada para quem prefere menos movimento.
export function Reveal({ children, className, style, ...options }: RevealProps) {
  if (reducedMotion) {
    const domProps = Object.fromEntries(Object.entries(options).filter(([key]) => isDomProp(key)))
    return (
      <div className={className} style={style} {...domProps}>
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
