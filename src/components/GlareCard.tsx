import type { ReactNode } from 'react'
import { useTheme } from '../lib/theme'
import GlareHover from './reactbits/GlareHover/GlareHover'

// Card com o reflexo do React Bits (GlareHover), com cores de cada tema.
export function GlareCard({ className = '', children }: { className?: string; children: ReactNode }) {
  const { theme } = useTheme()
  return (
    <GlareHover
      className={`card ${className}`}
      width="100%"
      height="100%"
      background="var(--surface)"
      borderColor="var(--border)"
      borderRadius="var(--radius)"
      glareColor={theme === 'dark' ? '#ffffff' : '#4f46e5'}
      glareOpacity={theme === 'dark' ? 0.12 : 0.1}
      glareAngle={-30}
      glareSize={300}
      transitionDuration={800}
    >
      {children}
    </GlareHover>
  )
}
