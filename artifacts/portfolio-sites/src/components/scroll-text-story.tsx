import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Monitor, Smartphone, Tablet } from 'lucide-react';
import { ScrollBaseAnimation } from '@/components/ui/scroll-text-marque';
import { TextAnimation } from '@/components/ui/scroll-text';

const blurReveal: Parameters<typeof TextAnimation>[0]['variants'] = {
  hidden: { filter: 'blur(12px)', opacity: 0, y: 18, scale: 0.97 },
  visible: {
    filter: 'blur(0px)',
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.85, ease: 'easeOut' },
  },
};

const fadeReveal: Parameters<typeof TextAnimation>[0]['variants'] = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' },
  },
};

const devices = [
  { label: 'Celular', Icon: Smartphone },
  { label: 'Tablet', Icon: Tablet },
  { label: 'Desktop', Icon: Monitor },
];

export function ScrollTextStory() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section id="historia" className="scroll-story" aria-label="Uma história sobre sites que ajudam negócios" data-testid="section-scroll-story">
      <article className="scroll-story-block scroll-story-hook" data-testid="scroll-story-block-0">
        <div className="scroll-story-inner">
          <TextAnimation
            text="Você está deixando dinheiro na mesa."
            letterAnime
            highlightWord="dinheiro"
            className="scroll-story-text scroll-story-hook-text"
            testId="text-scroll-story-hook"
          />
        </div>
      </article>

      <article className="scroll-story-block scroll-story-pain scroll-story-pain-no-site" data-testid="scroll-story-block-1">
        <div className="scroll-story-inner">
          <TextAnimation
            as="p"
            text="Sem um site, seu negócio é invisível no Google. Seu concorrente aparece. Você, não."
            direction="down"
            className="scroll-story-text"
            testId="text-scroll-story-no-site"
          />
        </div>
      </article>

      <article className="scroll-story-block scroll-story-pain scroll-story-pain-confusing-site" data-testid="scroll-story-block-2">
        <div className="scroll-story-inner">
          <TextAnimation
            as="p"
            text="Com um site confuso, você paga o marketing, atrai o cliente... e perde ele na hora do clique."
            direction="right"
            className="scroll-story-text"
            testId="text-scroll-story-confusing-site"
          />
        </div>
      </article>

      <article className="scroll-story-block scroll-story-solution" data-testid="scroll-story-block-3">
        <div className="scroll-story-inner">
          <TextAnimation
            text="Eu crio sites que transformam visitas em clientes."
            variants={blurReveal}
            className="scroll-story-text"
            testId="text-scroll-story-solution"
          />
        </div>
      </article>

      <article className="scroll-story-block scroll-story-proof" data-testid="scroll-story-block-4">
        <div className="scroll-story-inner">
          <div className="scroll-story-device-icons" aria-hidden="true">
            {devices.map(({ label, Icon }) => (
              <span key={label} className="scroll-story-device">
                <Icon size={28} strokeWidth={1.6} />
                <span>{label}</span>
              </span>
            ))}
          </div>
          <TextAnimation
            as="p"
            text="Intuitivo no celular. Perfeito no tablet. Impecável no desktop."
            letterAnime
            className="scroll-story-text"
            testId="text-scroll-story-proof"
          />
        </div>
      </article>

      <article className="scroll-story-block scroll-story-cta" data-testid="scroll-story-block-5">
        <div className="scroll-story-inner scroll-story-marquee">
          <div className="scroll-story-marquee-lines" data-testid="text-scroll-story-cta">
            <ScrollBaseAnimation
              delay={500}
              baseVelocity={-3}
              scrollDependent
              clasname="font-bold tracking-[-0.07em] leading-[90%]"
            >
              Pronto para parar de perder clientes?
            </ScrollBaseAnimation>
            <ScrollBaseAnimation
              delay={500}
              baseVelocity={3}
              scrollDependent
              clasname="font-bold tracking-[-0.07em] leading-[90%]"
            >
              Pronto para parar de perder clientes?
            </ScrollBaseAnimation>
          </div>
          <motion.a
            href="#contato"
            className="scroll-story-cta-link"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.35 }}
            transition={prefersReducedMotion
              ? { duration: 0 }
              : { duration: 0.6, delay: 0.16, ease: 'easeOut' }}
            data-testid="link-scroll-story-contact"
          >
            Quero conversar sobre meu site <ArrowRight size={18} aria-hidden="true" />
          </motion.a>
        </div>
      </article>
    </section>
  );
}
