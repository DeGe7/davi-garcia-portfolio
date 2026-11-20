import { useEffect, useRef, type ReactNode } from 'react';

type SwarmCursorProps = {
  count?: number;
  size?: number;
  spread?: number;
  swirl?: number;
  clickEffect?: 'burst' | 'none';
  children: ReactNode;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  orbitSpeed: number;
  margin: number;
  scatterX: number;
  scatterY: number;
  historyBucket: number;
  size: number;
  alpha: number;
  burstFrames: number;
};

type PointerSample = { x: number; y: number; time: number };

const HISTORY_BUCKETS = 32;
const MAX_POINTER_DELAY = 520;
const BUTTON_SELECTOR = 'button, a, [role="button"], input[type="button"], input[type="submit"], [data-cursor-orbit]';

function makeParticle(x: number, y: number, spread: number, size: number): Particle {
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.sqrt(Math.random()) * spread;
  return {
    x: x + Math.cos(angle) * radius,
    y: y + Math.sin(angle) * radius * 0.72,
    vx: 0,
    vy: 0,
    angle,
    orbitSpeed: 0.55 + Math.random() * 1.15,
    margin: 8 + Math.random() * 28,
    scatterX: Math.cos(angle) * (10 + Math.random() * spread * 0.42),
    scatterY: Math.sin(angle) * (8 + Math.random() * spread * 0.3),
    historyBucket: Math.floor(Math.random() * HISTORY_BUCKETS),
    size: size * (0.42 + Math.random() * 0.58),
    alpha: 0.18 + Math.random() * 0.38,
    burstFrames: 0,
  };
}

function findOrbitTarget(target: EventTarget | null): Element | null {
  if (!(target instanceof Element)) return null;
  return target.closest(BUTTON_SELECTOR);
}

export default function SwarmCursor({
  count = 800,
  size = 2.6,
  spread = 90,
  swirl = 0.6,
  clickEffect = 'burst',
  children,
}: SwarmCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: true });
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!canvas || !context || !finePointer.matches || reducedMotion.matches) return;

    const pointer: {
      x: number;
      y: number;
      active: boolean;
      orbitTarget: Element | null;
    } = { x: -spread, y: -spread, active: false, orbitTarget: null };
    let pointerHistory: PointerSample[] = [];
    let particles: Particle[] = [];
    let frame = 0;
    let pixelRatio = 1;

    const createParticles = () =>
      Array.from({ length: count }, () => makeParticle(pointer.x, pointer.y, spread, size));

    const updateOrbitTarget = (target: EventTarget | null) => {
      pointer.orbitTarget = findOrbitTarget(target);
    };

    const sampleHistory = (time: number): PointerSample => {
      if (!pointerHistory.length) return { x: pointer.x, y: pointer.y, time };
      if (time <= pointerHistory[0].time) return pointerHistory[0];
      const last = pointerHistory[pointerHistory.length - 1];
      if (time >= last.time) return last;

      let low = 0;
      let high = pointerHistory.length - 1;
      while (low < high) {
        const middle = Math.floor((low + high) / 2);
        if (pointerHistory[middle].time < time) low = middle + 1;
        else high = middle;
      }

      const after = pointerHistory[low];
      const before = pointerHistory[Math.max(0, low - 1)];
      const progress = (time - before.time) / Math.max(1, after.time - before.time);
      return {
        x: before.x + (after.x - before.x) * progress,
        y: before.y + (after.y - before.y) * progress,
        time,
      };
    };

    const resizeCanvas = () => {
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(window.innerWidth * pixelRatio);
      canvas.height = Math.round(window.innerHeight * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      if (pointer.active) particles = createParticles();
    };

    const draw = (now: number) => {
      frame = 0;
      if (!pointer.active) return;
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      context.fillStyle = '#477ed1';

      const historyTargets = Array.from({ length: HISTORY_BUCKETS }, (_, bucket) => {
        const delay = (bucket / (HISTORY_BUCKETS - 1)) * MAX_POINTER_DELAY;
        return sampleHistory(now - delay);
      });
      const orbitRect = pointer.orbitTarget?.isConnected
        ? pointer.orbitTarget.getBoundingClientRect()
        : null;
      if (pointer.orbitTarget && !orbitRect) pointer.orbitTarget = null;

      particles.forEach((particle) => {
        if (particle.burstFrames > 0) {
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.vx *= 0.92;
          particle.vy *= 0.92;
          particle.burstFrames -= 1;
        } else {
          const orbit = particle.angle + now * swirl * 0.0005 * particle.orbitSpeed;
          let targetX: number;
          let targetY: number;

          if (orbitRect && orbitRect.width > 0 && orbitRect.height > 0) {
            targetX =
              orbitRect.left +
              orbitRect.width / 2 +
              Math.cos(orbit) * (orbitRect.width / 2 + particle.margin);
            targetY =
              orbitRect.top +
              orbitRect.height / 2 +
              Math.sin(orbit) * (orbitRect.height / 2 + particle.margin * 0.8);
          } else {
            const delayedPointer = historyTargets[particle.historyBucket];
            const drift = now * swirl * 0.0007 * particle.orbitSpeed;
            targetX = delayedPointer.x + Math.cos(orbit + drift) * particle.scatterX;
            targetY = delayedPointer.y + Math.sin(orbit + drift) * particle.scatterY;
          }

          particle.vx = (particle.vx + (targetX - particle.x) * 0.075) * 0.82;
          particle.vy = (particle.vy + (targetY - particle.y) * 0.075) * 0.82;
          particle.x += particle.vx;
          particle.y += particle.vy;
        }

        context.globalAlpha = particle.alpha;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      });

      context.globalAlpha = 0.95;
      context.beginPath();
      context.arc(pointer.x, pointer.y, 2.2, 0, Math.PI * 2);
      context.fill();
      context.globalAlpha = 1;
      frame = window.requestAnimationFrame(draw);
    };

    const startDrawing = () => {
      if (!frame) frame = window.requestAnimationFrame(draw);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      const now = performance.now();
      pointerHistory.push({ x: pointer.x, y: pointer.y, time: now });
      while (pointerHistory.length > 2 && now - pointerHistory[0].time > MAX_POINTER_DELAY + 100) {
        pointerHistory.shift();
      }
      updateOrbitTarget(event.target);
      if (!pointer.active) {
        pointer.active = true;
        pointerHistory = Array.from({ length: HISTORY_BUCKETS }, (_, index) => ({
          x: pointer.x,
          y: pointer.y,
          time: now - MAX_POINTER_DELAY + (index / (HISTORY_BUCKETS - 1)) * MAX_POINTER_DELAY,
        }));
        particles = createParticles();
      }
      startDrawing();
    };

    const handleScroll = () => {
      if (!pointer.active) return;
      updateOrbitTarget(document.elementFromPoint(pointer.x, pointer.y));
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (clickEffect !== 'burst' || !pointer.active) return;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      particles.forEach((particle) => {
        const angle = Math.atan2(particle.y - pointer.y, particle.x - pointer.x);
        const speed = 2.4 + Math.random() * 3.4;
        particle.vx = Math.cos(angle) * speed;
        particle.vy = Math.sin(angle) * speed;
        particle.burstFrames = 30;
      });
      startDrawing();
    };

    const hideSwarm = () => {
      pointer.active = false;
      pointer.orbitTarget = null;
      pointerHistory = [];
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('blur', hideSwarm);
    document.documentElement.addEventListener('mouseleave', hideSwarm);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('blur', hideSwarm);
      document.documentElement.removeEventListener('mouseleave', hideSwarm);
      if (frame) window.cancelAnimationFrame(frame);
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    };
  }, [count, size, spread, swirl, clickEffect]);

  return (
    <div className="swarm-cursor-root">
      {children}
      <canvas ref={canvasRef} className="swarm-cursor-canvas" aria-hidden="true" />
    </div>
  );
}
