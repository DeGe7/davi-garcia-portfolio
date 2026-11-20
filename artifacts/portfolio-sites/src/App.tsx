import { type AnimationEvent, type CSSProperties, type FormEvent, type ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ReactLenis, useLenis } from 'lenis/react';
import { ErrorBoundary } from '@/components/error-boundary';
import { FlowingRibbonsBackground } from '@/components/interactive-dots-background';
import { HeroDeviceShowcase, type HeroDeviceMorphController } from '@/components/hero-device-showcase';
import real100Bill from '@/assets/real-100.webp';
import SwarmCursor from '@/components/SwarmCursor';
import { ScrollTextStory } from '@/components/scroll-text-story';
import { Showreel } from '@/components/showreel';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { CoursesDemo, InstitutionalDemo, ScrollDemo } from '@/pages/demos';
import { ArrowRight, ArrowUpRight, Check, ChevronDown, MoveUpRight } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Route,
  Switch,
  useLocation,
  Link,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();
gsap.registerPlugin(ScrollTrigger);

function LenisScrollTriggerBridge() {
  useLenis(() => ScrollTrigger.update(), []);
  return null;
}

type HeroDustParticle = {
  id: number;
  left: number;
  top: number;
  driftX: number;
  fallDistance: number;
  size: number;
  duration: number;
  delay: number;
  rotation: number;
  color: string;
};

function ScrollFloat({ children, distance = 18, tilt = 0, className }: { children: ReactNode; distance?: number; tilt?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!element) return;

    let frame = 0;
    let previousOffset = 0;
    const updatePosition = () => {
      frame = 0;
      if (reducedMotion.matches) {
        previousOffset = 0;
        element.style.transform = 'translate3d(0, 0, 0) rotate(0deg) scale(1)';
        return;
      }
      const bounds = element.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const untransformedTop = bounds.top - previousOffset;
      if (untransformedTop + bounds.height < 0 || untransformedTop > viewportHeight) return;
      const progress = (viewportHeight - untransformedTop) / (viewportHeight + bounds.height);
      const travel = progress * 2 - 1;
      const mobileFactor = window.innerWidth < 768 ? 0.48 : 1;
      previousOffset = -travel * distance * mobileFactor;
      const horizontalOffset = Math.sin(progress * Math.PI * 2) * distance * 0.3 * mobileFactor;
      const rotation = travel * tilt * mobileFactor;
      const scale = 1 - Math.abs(travel) * 0.07;
      element.style.transform = `translate3d(${horizontalOffset.toFixed(1)}px, ${previousOffset.toFixed(1)}px, 0) rotate(${rotation.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
    };
    const requestPositionUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updatePosition);
    };

    element.style.transformOrigin = 'center center';
    element.style.willChange = reducedMotion.matches ? 'auto' : 'transform';
    window.addEventListener('scroll', requestPositionUpdate, { passive: true });
    window.addEventListener('resize', requestPositionUpdate, { passive: true });
    reducedMotion.addEventListener('change', requestPositionUpdate);
    requestPositionUpdate();

    return () => {
      window.removeEventListener('scroll', requestPositionUpdate);
      window.removeEventListener('resize', requestPositionUpdate);
      reducedMotion.removeEventListener('change', requestPositionUpdate);
      if (frame) window.cancelAnimationFrame(frame);
      previousOffset = 0;
      element.style.transform = '';
      element.style.transformOrigin = '';
      element.style.willChange = '';
    };
  }, [distance, tilt]);

  return <div ref={ref} className={className}>{children}</div>;
}

function HeroGlyphText({ text }: { text: string }) {
  const textSeed = Array.from(text).reduce(
    (seed, character, index) => seed + character.codePointAt(0)! * (index + 1),
    0,
  );
  return (
    <span className="hero-glyph-text" aria-hidden="true">
      {text.split(/(\s+)/u).map((part, partIndex) => (
        /^\s+$/u.test(part)
          ? <span key={`space-${partIndex}`} className="hero-hover-space">{part}</span>
          : <span key={`word-${partIndex}`} className="hero-hover-word">
            {Array.from(part).map((glyph, glyphIndex) => (
              <span
                key={glyphIndex}
                className="hero-hover-glyph"
                style={{
                  '--hero-float-delay': `${-((textSeed + partIndex * 7 + glyphIndex * 3) % 13) * 0.31}s`,
                  '--hero-float-duration': `${2.8 + ((textSeed + partIndex * 5 + glyphIndex * 2) % 6) * 0.22}s`,
                } as CSSProperties}
              >
                {glyph}
              </span>
            ))}
          </span>
      ))}
    </span>
  );
}

function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [sent, setSent] = useState(false);
  const [showMoneyHeadline, setShowMoneyHeadline] = useState(false);
  const [headlineLoopActive, setHeadlineLoopActive] = useState(true);
  const [heroDust, setHeroDust] = useState<HeroDustParticle[]>([]);
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const heroViewportRef = useRef<HTMLDivElement | null>(null);
  const heroCopyRef = useRef<HTMLDivElement | null>(null);
  const heroBrandRef = useRef<HTMLAnchorElement | null>(null);
  const heroDeviceZoomRef = useRef<HTMLDivElement | null>(null);
  const heroMorphControllerRef = useRef<HeroDeviceMorphController | null>(null);
  const heroTitleRef = useRef<HTMLHeadingElement | null>(null);
  const heroMoneyWordElementRef = useRef<HTMLSpanElement | null>(null);
  const [heroMoneyWordMounted, setHeroMoneyWordMounted] = useState(false);
  const setHeroMoneyWordRef = useCallback((node: HTMLSpanElement | null) => {
    heroMoneyWordElementRef.current = node;
    setHeroMoneyWordMounted(node !== null);
  }, []);
  const setHeroMorphController = useCallback((controller: HeroDeviceMorphController | null) => {
    heroMorphControllerRef.current = controller;
  }, []);
  const nextDustId = useRef(0);
  const dustTimers = useRef(new Map<number, number>());
  const prefersReducedMotion = useReducedMotion();
  const spawnQuakeDust = useCallback((event: AnimationEvent<HTMLSpanElement>) => {
    const viewport = heroViewportRef.current;
    if (!viewport || prefersReducedMotion) return;

    const viewportBounds = viewport.getBoundingClientRect();
    const wordBounds = event.currentTarget.getBoundingClientRect();
    const colors = ['#78a8f2', '#a7c8fb', '#d4e5ff', '#477ed1'];
    const fallRatio = 0.88;
    const particles = Array.from({ length: 10 }, () => {
      const top = wordBounds.top - viewportBounds.top + wordBounds.height * (0.58 + Math.random() * 0.42);
      return {
        id: nextDustId.current++,
        left: wordBounds.left - viewportBounds.left + wordBounds.width * Math.random(),
        top,
        driftX: (Math.random() - 0.5) * 100,
        fallDistance: Math.max(0, (viewportBounds.height - top - Math.random() * 28) * fallRatio),
        size: 1.8 + Math.random() * 3.8,
        duration: 2300 + Math.random() * 1500,
        delay: Math.random() * 130,
        rotation: (Math.random() - 0.5) * 540,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
    });

    setHeroDust((current) => [...current, ...particles].slice(-100));
    particles.forEach((particle) => {
      const timer = window.setTimeout(() => {
        setHeroDust((current) => current.filter(({ id }) => id !== particle.id));
        dustTimers.current.delete(particle.id);
      }, particle.duration + particle.delay + 100);
      dustTimers.current.set(particle.id, timer);
    });
  }, [prefersReducedMotion]);

  useEffect(() => () => {
    dustTimers.current.forEach((timer) => window.clearTimeout(timer));
    dustTimers.current.clear();
  }, []);

  useLayoutEffect(() => {
    if (!showMoneyHeadline || !heroMoneyWordMounted) return;

    const section = heroSectionRef.current;
    const viewport = heroViewportRef.current;
    const word = heroMoneyWordElementRef.current;
    if (!section || !viewport || !word) return;

    const updateDistance = () => {
      const viewportBottom = viewport.getBoundingClientRect().bottom;
      const wordBottom = word.getBoundingClientRect().bottom;
      const distance = Math.max(0, (viewportBottom - wordBottom - 24) * 0.88);
      section.style.setProperty('--hero-particle-distance', `${distance}px`);
    };

    updateDistance();
    const observer = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(updateDistance);
    observer?.observe(viewport);
    observer?.observe(word);
    window.addEventListener('resize', updateDistance, { passive: true });

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateDistance);
    };
  }, [showMoneyHeadline, heroMoneyWordMounted]);

  useLayoutEffect(() => {
    const section = heroSectionRef.current;
    const viewport = heroViewportRef.current;
    const copy = heroCopyRef.current;
    const brand = heroBrandRef.current;
    const device = heroDeviceZoomRef.current;
    const zoomTarget = device?.querySelector<HTMLElement>('.hero-device-stage');
    const silhouette = zoomTarget?.querySelector<SVGPathElement>('.hero-morph-shape');
    const caption = device?.querySelector<HTMLElement>('.hero-device-caption');
    if (!section || !viewport || !copy || !brand || !device || !zoomTarget || !silhouette) return;

    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const resetZoom = () => {
        gsap.set(zoomTarget, { x: 0, y: 0, scale: 1, transformOrigin: '50% 50%' });
      };
      const silhouetteBounds = () => silhouette.getBoundingClientRect();

      resetZoom();

      const centerX = () => {
        const frameBounds = viewport.getBoundingClientRect();
        const bounds = zoomTarget.getBoundingClientRect();
        return frameBounds.left + frameBounds.width / 2 - bounds.left - bounds.width / 2;
      };
      const centerY = () => {
        const frameBounds = viewport.getBoundingClientRect();
        const bounds = zoomTarget.getBoundingClientRect();
        return frameBounds.top + frameBounds.height / 2 - bounds.top - bounds.height / 2;
      };
      const screenFillScale = () => {
        const frameBounds = viewport.getBoundingClientRect();
        const bounds = silhouetteBounds();
        return Math.max(
          frameBounds.width / bounds.width,
          frameBounds.height / bounds.height,
        ) * 1.04;
      };

      const morphToMonitor = { progress: 0 };
      const heroCopyFadePortion = 0.13;
      const monitorMorphPortion = 0.16;
      let monitorMorphStarted = false;
      let monitorMorphComplete = false;
      let headlineResumeTimer: number | null = null;
      let latestHeadlineProgress = 0;
      const clearHeadlineResumeTimer = () => {
        if (headlineResumeTimer !== null) window.clearTimeout(headlineResumeTimer);
        headlineResumeTimer = null;
      };
      const syncMonitorMorph = () => {
        if (!monitorMorphStarted || monitorMorphComplete) return;
        const controller = heroMorphControllerRef.current;
        if (!controller) return;
        controller.setScrollMorphProgress(morphToMonitor.progress);
        if (morphToMonitor.progress >= 1) {
          controller.resumeFromMonitor();
          monitorMorphStarted = false;
          monitorMorphComplete = true;
        }
      };
      const beginMonitorMorph = () => {
        if (monitorMorphStarted || monitorMorphComplete) return;
        const controller = heroMorphControllerRef.current;
        if (!controller) return;
        controller.beginScrollMorph();
        monitorMorphStarted = true;
        syncMonitorMorph();
      };
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: viewport,
          pinSpacing: false,
          start: 'top top',
          end: () => `+=${Math.round(section.getBoundingClientRect().height)}`,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            latestHeadlineProgress = self.progress;
            const headlineVisible = self.progress <= heroCopyFadePortion;
            if (self.direction < 0 && headlineVisible) {
              setShowMoneyHeadline(false);
              setHeadlineLoopActive(false);
              clearHeadlineResumeTimer();
              headlineResumeTimer = window.setTimeout(() => {
                headlineResumeTimer = null;
                if (latestHeadlineProgress <= heroCopyFadePortion) {
                  setShowMoneyHeadline(false);
                  setHeadlineLoopActive(true);
                }
              }, 600);
            } else {
              clearHeadlineResumeTimer();
              setHeadlineLoopActive(headlineVisible);
            }
            if (self.scroll() > self.start + 1) beginMonitorMorph();
          },
          onRefreshInit: resetZoom,
          onEnterBack: () => {
            clearHeadlineResumeTimer();
            setShowMoneyHeadline(false);
            setHeadlineLoopActive(false);
          },
          onLeaveBack: () => {
            heroMorphControllerRef.current?.resumeAutonomous();
            monitorMorphStarted = false;
            monitorMorphComplete = false;
          },
        },
      });

      timeline
        .to(copy, { autoAlpha: 0, y: -36, duration: heroCopyFadePortion, ease: 'none' }, 0)
        .to(brand, { autoAlpha: 0, y: -16, duration: heroCopyFadePortion, ease: 'none' }, 0)
        .to(morphToMonitor, {
          progress: 1,
          duration: monitorMorphPortion,
          ease: 'power1.inOut',
          onUpdate: syncMonitorMorph,
        }, 0)
        .to(zoomTarget, {
          x: centerX,
          y: centerY,
          scale: screenFillScale,
          zIndex: 30,
          duration: 1 - monitorMorphPortion,
          ease: 'none',
        }, monitorMorphPortion)
        .to(viewport, { backgroundColor: '#e6efff', duration: 0.12, ease: 'none' }, 0.88);

      if (caption) {
        timeline.to(caption, { autoAlpha: 0, duration: 0.1, ease: 'none' }, monitorMorphPortion);
      }

      const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
      document.fonts?.ready.then(() => ScrollTrigger.refresh());
      return () => {
        clearHeadlineResumeTimer();
        window.cancelAnimationFrame(refreshFrame);
      };
    });

    return () => media.revert();
  }, []);

  useEffect(() => {
    const section = heroViewportRef.current;
    const title = heroTitleRef.current;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!section || !title || !finePointer.matches || prefersReducedMotion) return;

    let frame = 0;
    let shiftX = 0;
    let shiftY = 0;
    let pointerX: number | null = null;
    let pointerY: number | null = null;
    const updateTitle = () => {
      frame = 0;
      title.style.setProperty('--hero-cursor-shift-x', `${shiftX.toFixed(1)}px`);
      title.style.setProperty('--hero-cursor-shift-y', `${shiftY.toFixed(1)}px`);
      title.querySelectorAll<HTMLElement>('.hero-hover-glyph').forEach((glyph) => {
        if (pointerX === null || pointerY === null) {
          glyph.style.removeProperty('--hero-glyph-lift');
          glyph.style.removeProperty('--hero-glyph-scale');
          glyph.style.removeProperty('--hero-glyph-rotation');
          return;
        }
        const glyphBounds = glyph.getBoundingClientRect();
        const distanceX = glyphBounds.left + glyphBounds.width / 2 - pointerX;
        const distanceY = glyphBounds.top + glyphBounds.height / 2 - pointerY;
        const fontSize = Number.parseFloat(getComputedStyle(glyph).fontSize) || 48;
        const radius = Math.max(96, fontSize * 2.1);
        const proximity = Math.max(0, 1 - Math.hypot(distanceX, distanceY) / radius) ** 1.5;
        if (proximity === 0) {
          glyph.style.removeProperty('--hero-glyph-lift');
          glyph.style.removeProperty('--hero-glyph-scale');
          glyph.style.removeProperty('--hero-glyph-rotation');
          return;
        }
        const rotation = Math.max(-30, Math.min(30, distanceX / radius * 30)) * proximity;
        glyph.style.setProperty('--hero-glyph-lift', `${(-fontSize * 0.1 * proximity).toFixed(2)}px`);
        glyph.style.setProperty('--hero-glyph-scale', `${(1 + 0.075 * proximity).toFixed(3)}`);
        glyph.style.setProperty('--hero-glyph-rotation', `${rotation.toFixed(2)}deg`);
      });
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;

      pointerX = event.clientX;
      pointerY = event.clientY;
      const bounds = section.getBoundingClientRect();
      const normalizedX = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      const normalizedY = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
      shiftX = Math.max(-9, Math.min(9, normalizedX * -9));
      shiftY = Math.max(-6, Math.min(6, normalizedY * -6));
      if (!frame) frame = window.requestAnimationFrame(updateTitle);
    };
    const resetTitle = () => {
      shiftX = 0;
      shiftY = 0;
      pointerX = null;
      pointerY = null;
      if (!frame) frame = window.requestAnimationFrame(updateTitle);
    };
    const observer = new MutationObserver(() => {
      if (pointerX !== null && pointerY !== null && !frame) {
        frame = window.requestAnimationFrame(updateTitle);
      }
    });
    observer.observe(title, { childList: true, subtree: true });

    section.addEventListener('pointermove', handlePointerMove, { passive: true });
    section.addEventListener('pointerleave', resetTitle, { passive: true });
    return () => {
      section.removeEventListener('pointermove', handlePointerMove);
      section.removeEventListener('pointerleave', resetTitle);
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      title.style.removeProperty('--hero-cursor-shift-x');
      title.style.removeProperty('--hero-cursor-shift-y');
    };
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) {
      setShowMoneyHeadline(true);
      return;
    }
    if (!headlineLoopActive) return;
    const displayDuration = showMoneyHeadline ? 9500 : 3600;
    const timer = window.setTimeout(() => setShowMoneyHeadline((current) => !current), displayDuration);
    return () => window.clearTimeout(timer);
  }, [prefersReducedMotion, showMoneyHeadline, headlineLoopActive]);
  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>('[data-motion-reveal]');
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach((target) => target.setAttribute('data-motion-state', 'entered'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const target = entry.target as HTMLElement;
        if (entry.isIntersecting) {
          target.setAttribute('data-motion-state', 'entered');
        } else {
          target.setAttribute('data-motion-state', 'waiting');
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [prefersReducedMotion]);
  const mail = 'contato@seudominio.com.br';
  const sendBrief = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const subject = encodeURIComponent(`Preço de um site — ${data.get('nome')}`);
    const body = encodeURIComponent(
      `Olá! Meu nome é ${data.get('nome')}.\n\nMeu negócio: ${data.get('negocio')}\nO que quero no site: ${data.get('mensagem')}\n\nPodemos conversar?`,
    );
    setSent(true);
    window.location.href = `mailto:${mail}?subject=${subject}&body=${body}`;
  };
  const faqs = [
    ['Quanto custa um site?', 'O preço depende do que você precisa. Depois de conversar com você, explico o que vou fazer, quanto custa e qual é o prazo.'],
    ['Quanto tempo leva para ficar pronto?', 'O prazo depende do que vamos criar e de quando você me envia textos e fotos. Combinamos as datas antes de começar.'],
    ['Preciso ter textos e fotos prontos?', 'Não. Posso ajudar você a decidir quais informações e fotos usar. A gente organiza tudo antes de montar o site.'],
    ['O site funciona bem no celular?', 'Sim. O site funciona no celular e no computador, com texto fácil de ler e um jeito simples de entrar em contato.'],
    ['O assistente de IA é obrigatório?', 'Não. Ele é opcional e aparece em uma janelinha de conversa. Pode responder dúvidas e explicar serviços ou horários.'],
  ];
  return (
    <SwarmCursor count={800} size={2.6} spread={90} swirl={0.6} clickEffect="burst">
    <div className="site-shell min-h-[100dvh] bg-[#f6f4ec] text-[#172f52]">
      <FlowingRibbonsBackground />
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-[#193a34] focus:px-4 focus:py-3 focus:text-white">Pular para o conteúdo</a>

      <main id="conteudo">
        <section id="inicio" ref={heroSectionRef} className="hero-scroll-section relative">
          <div className="hero-scroll-viewport" ref={heroViewportRef}>
            <div className="hero-brand-wrap container-wide">
              <a ref={heroBrandRef} href="#inicio" aria-label="Davi Garcia, início" className="hero-brand" data-testid="link-home">Davi Garcia</a>
            </div>
            <div className="hero-dust-field" aria-hidden="true">
              {heroDust.map((particle) => (
                <i
                  key={particle.id}
                  className="hero-dust-particle"
                  style={{
                    left: `${particle.left}px`,
                    top: `${particle.top}px`,
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    backgroundColor: particle.color,
                    animationDuration: `${particle.duration}ms`,
                    animationDelay: `${particle.delay}ms`,
                    '--particle-drift': `${particle.driftX}px`,
                    '--particle-fall': `${particle.fallDistance}px`,
                    '--particle-rotation': `${particle.rotation}deg`,
                  } as CSSProperties}
                />
              ))}
            </div>
            <div className="container-wide hero-scroll-layout grid items-center gap-14 md:grid-cols-[1.07fr_.93fr] md:gap-4">
              <div ref={heroCopyRef} data-hero-copy className="relative z-10 max-w-[720px]">
              <h1 ref={heroTitleRef} data-motion-reveal aria-live="polite" aria-atomic="true" aria-label={showMoneyHeadline ? 'Nos dois casos, você está deixando dinheiro na mesa!' : 'Seu site é confuso ou você nem tem um site?'} style={{ '--reveal-delay': '100ms' } as CSSProperties} className="hero-home-title display-font reveal reveal-delay-1">
                <AnimatePresence mode="wait" initial={false}>
                  {showMoneyHeadline ? (
                    <motion.span
                      key="money-headline"
                      className="hero-headline-copy block"
                      aria-hidden="true"
                      initial={{ opacity: 0, y: 18, filter: 'blur(4px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -14, filter: 'blur(4px)' }}
                      transition={{ duration: 0.5, ease: [0.2, 0.72, 0.24, 1] }}
                    >
                      <HeroGlyphText text="Nos dois casos," /><br /><HeroGlyphText text="você está" /> <br className="hidden md:block" />
                      <span className="hero-headline-blue">
                        <HeroGlyphText text="deixando" />{' '}<span ref={setHeroMoneyWordRef} className="hero-money-word"><span className="hero-money-word-label"><HeroGlyphText text="dinheiro" /></span>
                          <span className="hero-money-rain" aria-hidden="true">
                            {Array.from({ length: 12 }, (_, index) => (
                              <img key={index} className="hero-banknote" src={real100Bill} alt="" draggable={false} />
                            ))}
                          </span>
                        </span>{' '}<HeroGlyphText text="na mesa!" />
                      </span>
                    </motion.span>
                  ) : (
                    <motion.span
                      key="problem-headline"
                      className="hero-headline-copy block"
                      aria-hidden="true"
                      initial={{ opacity: 0, y: 18, filter: 'blur(4px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -14, filter: 'blur(4px)' }}
                      transition={{ duration: 0.5, ease: [0.2, 0.72, 0.24, 1] }}
                    >
                      <HeroGlyphText text="Seu site é" /><br />
                      <span className="hero-quake-word" onAnimationIteration={spawnQuakeDust}>
                        <HeroGlyphText text="confuso" />
                      </span>{' '}<HeroGlyphText text="ou você" /><br />
                      <HeroGlyphText text="nem" />{' '}<span className="hero-quake-word hero-quake-word-delayed" onAnimationIteration={spawnQuakeDust}>
                        <HeroGlyphText text="tem" />
                      </span>{' '}<HeroGlyphText text="um site?" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </h1>
            </div>
            <div ref={heroDeviceZoomRef} data-hero-device-zoom className="hero-device-zoom relative z-20 mx-auto w-full max-w-[550px] md:ml-auto">
              <div className="hero-mockup relative mx-auto w-full max-w-[550px]">
                <HeroDeviceShowcase onControllerReady={setHeroMorphController} />
              </div>
            </div>
            </div>
          </div>
        </section>

        <ScrollTextStory />

        <Showreel />

        <section data-motion-reveal className="border-y border-[#193a34]/10 bg-[#ecebe1]">
          <div className="container-wide grid gap-5 py-7 md:grid-cols-[1fr_2fr] md:items-center">
            <p className="font-mono text-[10px] uppercase tracking-[.12em] text-[#6c817a]">Um site que ajuda<br className="hidden md:block"/> seu negócio</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {['Confiança antes do primeiro contato', 'Seu negócio, explicado sem ruído', 'Um caminho simples até você'].map((item, i) => <ScrollFloat key={item} distance={88 + i * 8} tilt={i === 1 ? -8 : 8} className="h-full">
                <article data-motion-reveal style={{ '--reveal-delay': `${i * 110}ms` } as CSSProperties} className="float-card flex h-full min-h-[88px] items-center gap-3 rounded-2xl border border-[#193a34]/10 bg-[#f8faff] p-4 shadow-[0_14px_34px_rgba(35,66,108,.1)] md:p-5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e1ebf8] font-mono text-[10px] text-[#477ed1]">0{i + 1}</span>
                  <p className="text-[12px] font-medium leading-5 text-[#31564d]">{item}</p>
                </article>
              </ScrollFloat>)}
            </div>
          </div>
        </section>

        <section id="servicos" className="container-wide py-24 md:py-32">
          <div className="grid gap-12 md:grid-cols-[.85fr_1.15fr]">
              <div data-motion-reveal>
              <p className="eyebrow">O que faço</p>
              <h2 className="display-font mt-6 max-w-[390px] text-4xl font-semibold leading-[1.05] md:text-[54px]">Um site feito para <span className="italic text-[#477ed1]">seu negócio.</span></h2>
              <p className="mt-6 max-w-[370px] text-[14px] leading-7 text-[#62776f]">O site vai explicar o que você faz e ajudar seus clientes a entrar em contato.</p>
              <a href="#contato" className="mt-8 inline-flex items-center gap-2 border-b border-[#477ed1] pb-2 text-[13px] font-semibold text-[#31564d]" data-testid="link-servicos-contato">Vamos falar do seu projeto <MoveUpRight size={15}/></a>
            </div>
            <div className="grid gap-3">
              {[
                ['01', 'Organização do site', 'Organizo as informações para que seus clientes entendam o que você oferece e saibam como falar com você.'],
                ['02', 'Visual e criação do site', 'Faço um site com a cara do seu negócio, que funciona bem no celular e no computador.'],
                ['03', 'Textos e contato', 'Escrevo textos simples e deixo seus dados de contato fáceis de encontrar.'],
                ['04', 'Conversa com IA (opcional)', 'Se quiser, incluo uma janelinha que conversa com seus visitantes e responde dúvidas comuns.'],
                ['05', 'Colocar o site no ar', 'Deixo o site disponível na internet e mostro como fazer mudanças simples.'],
              ].map(([num, title, text], index) => <ScrollFloat key={num} distance={92 + index % 2 * 12} tilt={index % 2 ? -8 : 8}>
                <article data-motion-reveal style={{ '--reveal-delay': `${index * 100}ms` } as CSSProperties} className="float-card grid grid-cols-[40px_1fr] items-start gap-4 rounded-2xl border border-[#193a34]/10 bg-[#fffdf7]/90 p-4 shadow-[0_14px_36px_rgba(35,66,108,.09)] min-[420px]:p-5 md:grid-cols-[50px_1fr] md:gap-6 md:py-6">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-[#e1ebf8] font-mono text-[11px] text-[#477ed1]">{num}</span>
                  <div><h3 className="display-font text-[19px] font-semibold">{title}</h3><p className="mt-2 max-w-[470px] text-[13px] leading-6 text-[#62776f]">{text}</p></div>
                </article>
              </ScrollFloat>)}
            </div>
          </div>
        </section>

        <section id="projetos" className="bg-[#193a34] py-24 text-[#f6f4ec] md:py-28">
          <div className="container-wide">
            <div className="grid gap-8 md:grid-cols-[.9fr_1.1fr] md:items-end">
              <div data-motion-reveal><p className="eyebrow !text-[#b5c9be]">A ideia segue</p><h2 className="display-font mt-5 text-4xl font-semibold leading-[1.04] md:text-[54px]">Três jeitos<br/>de <span className="italic text-[#9db7d8]">começar.</span></h2></div>
              <p className="max-w-[440px] text-[13px] leading-6 text-[#c0cec5]">Os exemplos são inventados e servem para mostrar possibilidades. Nenhum deles é trabalho de cliente. Você pode explorar os três agora e imaginar qual combina com o seu negócio.</p>
            </div>
            <div className="mt-11 grid border-t border-white/20 md:grid-cols-3">
              {[
                ['/demos/institucional', '01 / APRESENTAR', 'Site institucional', 'Um espaço claro para explicar o que você faz e facilitar o primeiro contato.'],
                ['/demos/scroll', '02 / CONTAR', 'Site com movimento', 'Uma sequência visual que acompanha a história enquanto a pessoa navega.'],
                ['/demos/cursos', '03 / ENSINAR', 'Plataforma de cursos', 'Aulas em ordem, progresso visível e espaço para aprender no próprio ritmo.'],
              ].map(([href, label, title, description]) => <Link key={href} href={href} className="group border-b border-white/20 py-6 md:border-b-0 md:border-r md:px-6 md:py-7 first:md:pl-0 last:md:border-r-0" data-testid={`link-projeto-${href.split('/').pop()}`}>
                <span className="font-mono text-[9px] tracking-[.13em] text-[#9db7d8]">{label}</span>
                <span className="mt-5 flex items-center justify-between gap-4"><span className="display-font text-[22px] font-semibold">{title}</span><ArrowUpRight className="shrink-0 text-[#9db7d8] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" size={17}/></span>
                <span className="mt-2 block max-w-[300px] text-[12px] leading-6 text-[#c0cec5]">{description}</span>
              </Link>)}
            </div>
            <div className="mt-7 font-mono text-[9px] tracking-wide text-[#b6c8be]">EXEMPLOS CONCEITUAIS · NÃO SÃO TRABALHOS DE CLIENTES</div>
          </div>
        </section>

        <section id="processo" className="container-wide py-24 md:py-32">
          <div className="grid gap-12 md:grid-cols-[.7fr_1.3fr]">
            <div data-motion-reveal><p className="eyebrow">Sem mistério</p><h2 className="display-font mt-6 text-4xl font-semibold leading-[1.05] md:text-[51px]">Da primeira conversa<br/>ao <i className="text-[#477ed1]">site pronto.</i></h2><p className="mt-5 max-w-[330px] text-[13px] leading-6 text-[#62776f]">Você acompanha cada etapa. Eu explico o que vem a seguir e tiro suas dúvidas por conversa direta.</p></div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ['01', 'A conversa', 'Quero entender seu negócio e o que você precisa. Essa conversa não custa nada.'],
                ['02', 'O plano', 'Você recebe uma lista do que vou fazer, o preço e o prazo. Só começo depois da sua aprovação.'],
                ['03', 'Criação do site', 'Monto o site e mostro para você. Você pode pedir as mudanças que combinarmos.'],
                ['04', 'Site pronto', 'Depois da sua aprovação, publico o site e deixo tudo organizado para você.'],
              ].map(([n, title, text], index) => <ScrollFloat key={n} distance={96 + index % 2 * 12} tilt={index % 2 ? -8 : 8}>
                <article data-motion-reveal style={{ '--reveal-delay': `${index * 120}ms` } as CSSProperties} className="float-card h-full rounded-2xl border border-[#193a34]/10 bg-[#fffdf7]/85 p-5 shadow-[0_16px_38px_rgba(35,66,108,.1)] sm:p-6">
                  <p className="font-mono text-[10px] text-[#477ed1]">{n} / 04</p>
                  <h3 className="display-font mt-3 text-[20px] font-semibold">{title}</h3>
                  <p className="mt-2 text-[12px] leading-6 text-[#62776f]">{text}</p>
                </article>
              </ScrollFloat>)}
            </div>
          </div>
        </section>

        <section className="bg-[#ecebe1] py-20 md:py-24">
          <div className="container-wide grid gap-12 md:grid-cols-[.75fr_1.25fr]">
              <div data-motion-reveal><p className="eyebrow">Dúvidas comuns</p><h2 className="display-font mt-6 text-4xl font-semibold leading-tight">Antes de<br/>começar.</h2><p className="mt-4 max-w-[280px] text-[13px] leading-6 text-[#62776f]">Ficou com outra dúvida? <a href={`mailto:${mail}`} className="underline decoration-[#477ed1] underline-offset-4">Me escreva por e-mail.</a></p></div>
            <div className="border-t border-[#193a34]/15">
              {faqs.map(([question, answer], index) => <div data-motion-reveal key={question} className="border-b border-[#193a34]/15">
                <button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)} aria-expanded={openFaq === index} aria-controls={`faq-answer-${index}`} className="flex w-full items-center justify-between gap-5 py-5 text-left" data-testid={`button-faq-${index}`}><span className="display-font text-[16px] font-semibold md:text-[18px]">{question}</span><ChevronDown size={18} className={`shrink-0 text-[#477ed1] transition-transform ${openFaq === index ? 'rotate-180' : ''}`}/></button>
                <div id={`faq-answer-${index}`} className={`faq-answer ${openFaq === index ? 'is-open' : ''}`} aria-hidden={openFaq !== index}><div><p className="max-w-[580px] pb-5 pr-7 text-[13px] leading-6 text-[#62776f]">{answer}</p></div></div>
              </div>)}
            </div>
          </div>
        </section>

        <section id="contato" className="relative overflow-hidden bg-[#477ed1] py-20 text-[#193a34] md:py-28">
          <div className="container-wide relative grid gap-12 md:grid-cols-[.95fr_1.05fr] md:items-center">
            <div data-motion-reveal><p className="eyebrow !text-[#4a6259]">Vamos conversar</p><h2 className="display-font mt-6 text-[clamp(2.8rem,6vw,5.2rem)] font-semibold leading-[.98]">Vamos criar<br/>um site para<br/><i>seu negócio.</i></h2><p className="mt-6 max-w-[400px] text-[14px] leading-7 text-[#36564b]">Conte o que seu negócio faz e o que você precisa. Eu respondo para a gente conversar.</p><a href={`mailto:${mail}`} className="mt-8 inline-flex items-center gap-2 border-b border-[#193a34]/40 pb-2 text-[13px] font-semibold" data-testid="link-email-direto">{mail} <ArrowUpRight size={15}/></a></div>
            <form data-motion-reveal style={{ '--reveal-delay': '100ms' } as CSSProperties} onSubmit={sendBrief} className="rounded-2xl bg-[#f8f5ed] p-6 shadow-[0_18px_60px_rgba(63,57,41,.12)] md:p-8">
              <p className="font-mono text-[10px] uppercase tracking-[.12em] text-[#6b8077]">Comece por aqui</p>
              <label className="mt-5 block text-[12px] font-semibold" htmlFor="nome">Como posso te chamar?</label>
              <input id="nome" name="nome" required autoComplete="name" placeholder="Seu nome" className="mt-2 h-12 w-full border-b border-[#193a34]/20 bg-transparent px-1 text-[14px] outline-none transition-colors placeholder:text-[#9aaba2] focus:border-[#477ed1]" data-testid="input-nome"/>
              <label className="mt-5 block text-[12px] font-semibold" htmlFor="negocio">Qual é o seu negócio?</label>
              <input id="negocio" name="negocio" required placeholder="Ex.: loja, salão ou consultório" className="mt-2 h-12 w-full border-b border-[#193a34]/20 bg-transparent px-1 text-[14px] outline-none transition-colors placeholder:text-[#9aaba2] focus:border-[#477ed1]" data-testid="input-negocio"/>
              <label className="mt-5 block text-[12px] font-semibold" htmlFor="mensagem">O que você quer mostrar no site?</label>
              <textarea id="mensagem" name="mensagem" rows={3} required placeholder="Conte sua ideia em poucas palavras." className="mt-2 w-full resize-y border-b border-[#193a34]/20 bg-transparent px-1 py-3 text-[14px] outline-none transition-colors placeholder:text-[#9aaba2] focus:border-[#477ed1]" data-testid="input-mensagem"/>
              <button type="submit" className="button-primary mt-6 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-full bg-[#193a34] px-6 text-[13px] font-semibold text-[#f6f4ec]" data-testid="button-enviar">Abrir meu e-mail <ArrowRight size={16}/></button>
              <p role="status" className="mt-3 min-h-5 text-center text-[11px] text-[#6b8077]" data-testid="status-contato">{sent ? 'Seu e-mail deve abrir com a mensagem pronta.' : 'Seu e-mail vai abrir para você ler e enviar a mensagem.'}</p>
            </form>
          </div>
        </section>
      </main>

      <footer className="bg-[#193a34] py-8 text-[#f6f4ec]">
        <div className="container-wide flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <a href="#inicio" className="flex items-center gap-3" aria-label="Voltar ao início"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#477ed1] text-[12px] font-bold tracking-[-.08em] text-[#173a34]">DG</span><span className="text-[12px] font-semibold">Davi Garcia <span className="font-normal text-[#b7c8bf]">· criação de sites</span></span></a>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-[#c0cec5]"><a href="#servicos" className="hover:text-white">O que faço</a><a href="#projetos" className="hover:text-white">Exemplos</a><a href="#contato" className="hover:text-white">Contato</a><a href={`mailto:${mail}`} className="inline-flex items-center gap-1 hover:text-white" data-testid="link-footer-email">{mail} <ArrowUpRight size={12}/></a></div>
          <p className="font-mono text-[9px] text-[#92aaa0]">© {new Date().getFullYear()} · feito com cuidado</p>
        </div>
      </footer>
    </div>
    </SwarmCursor>
  );
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/demos/institucional" component={InstitutionalDemo} />
        <Route path="/demos/scroll" component={ScrollDemo} />
        <Route path="/demos/cursos" component={CoursesDemo} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  const prefersReducedMotion = useReducedMotion();
  const appContent = (
    <>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </>
  );
  const lenisAppContent = (
    <>
      <LenisScrollTriggerBridge />
      {appContent}
    </>
  );

  return (
    <QueryClientProvider client={queryClient}>
      {prefersReducedMotion
        ? appContent
        : <ReactLenis root options={{ lerp: 0.1, smoothWheel: true, anchors: true }}>{lenisAppContent}</ReactLenis>}
    </QueryClientProvider>
  );
}

export default App;
