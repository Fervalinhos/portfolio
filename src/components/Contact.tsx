import { motion, type Variants } from 'motion/react'
import { useI18n } from '../lib/i18n'
import type { PortfolioData } from '../types'
import { Reveal } from './Reveal'
import { SocialLinks } from './SocialLinks'

const BAND: Variants = {
  hidden: { x: '110%' },
  shown: { x: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
}

export function Contact({ data }: { data: PortfolioData }) {
  const { t, formatDate } = useI18n()
  return (
    <>
      <section className="section contact" id="contact">
        {/* A faixa entra pela direita quando aparece na tela (observa o wrapper, que não se move). */}
        <motion.div className="band-wrap" initial="hidden" whileInView="shown" viewport={{ once: true, amount: 0.6 }}>
          <motion.div className="band" variants={BAND}>
            <h2 className="section__title">{t('contact.title')}</h2>
          </motion.div>
        </motion.div>
        <div className="container">
          <Reveal>
            <p className="section__subtitle">{t('contact.text')}</p>
          </Reveal>
          <Reveal delay={0.15}>
            <SocialLinks githubUrl={data.profile.url} website={data.profile.blog} />
          </Reveal>
        </div>
      </section>
      <footer className="footer">
        <div className="container footer__inner muted">
          <span>
            © {data.generatedAt.slice(0, 4)} {data.profile.name}
          </span>
          <span>{t('footer.updated', { d: formatDate(data.generatedAt) })}</span>
          <span>{t('footer.built')}</span>
        </div>
      </footer>
    </>
  )
}
