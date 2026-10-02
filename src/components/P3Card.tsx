import { motion, type Transition, type Variants } from 'motion/react'
import { useState, type FocusEvent, type ReactNode } from 'react'

// Cards no estilo dos menus de Persona 3 Reload, a mesma linguagem da boss battle do README do perfil:
// ao passar o mouse (ou focar com o teclado) o card é "selecionado" como um item de menu.
// Uma faixa inclinada entra por trás do título, o texto ganha rastro ciano e uma sombra ciano
// se desloca atrás do painel.

const EASE = [0.22, 1, 0.36, 1] as const
const ENTER: Transition = { duration: 0.7, ease: EASE }
const LEAVE: Transition = { duration: 0.4, ease: EASE }

const panel: Variants = {
  rest: { x: 0, y: 0, transition: LEAVE },
  active: { x: -3, y: -3, transition: { type: 'spring', stiffness: 160, damping: 20 } },
}

const shadow: Variants = {
  rest: { x: 0, y: 0, opacity: 0, transition: LEAVE },
  active: { x: 7, y: 7, opacity: 1, transition: ENTER },
}

const slab: Variants = {
  rest: { scaleX: 0, transition: LEAVE },
  active: { scaleX: 1, transition: ENTER },
}

const slabEcho: Variants = {
  rest: { scaleX: 0, transition: LEAVE },
  active: { scaleX: 1, transition: { ...ENTER, delay: 0.12 } },
}

const label: Variants = {
  rest: { x: 0, transition: LEAVE },
  active: { x: 10, transition: { type: 'spring', stiffness: 150, damping: 18, delay: 0.1 } },
}

export function P3Card({ className = '', children }: { className?: string; children: ReactNode }) {
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const active = hovered || focused

  const onBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false)
  }

  return (
    <motion.article
      className={`p3card ${active ? 'is-active' : ''} ${className}`}
      initial={false}
      animate={active ? 'active' : 'rest'}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={onBlur}
    >
      <motion.span className="p3card__shadow" variants={shadow} aria-hidden="true" />
      <motion.div className="p3card__panel" variants={panel}>
        <div className="p3card__inner">{children}</div>
      </motion.div>
    </motion.article>
  )
}

const SLANT = { skewX: -14, originX: 0 }

// Título com a faixa de seleção do menu (branca no tema escuro, azul-marinho no claro).
// Herda o estado "rest"/"active" do P3Card pelas variants do Motion.
export function P3Title({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <h3 className={`p3-title ${className}`}>
      <motion.span className="p3-title__slab p3-title__slab--echo" style={SLANT} variants={slabEcho} aria-hidden="true" />
      <motion.span className="p3-title__slab" style={SLANT} variants={slab} aria-hidden="true" />
      <motion.span className="p3-title__text" variants={label}>
        {children}
      </motion.span>
    </h3>
  )
}
