import { useEffect, useRef } from 'react';

type Disturbance = { x: number; y: number; time: number; intensity: number };

const DISTURBANCE_DURATION = 3000;
const MAX_DISTURBANCES = 4;
const BLUE_RIBBON = 'rgba(71, 126, 209, 0.56)';

export function FlowingRibbonsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = { x: -1000, y: -1000 };
    let disturbances: Disturbance[] = [];
    let frameId = 0;
    let lastFrame = 0;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let columns = 0;
    let rows = 0;

    const getDisturbance = (x: number, y: number, now: number) => {
      let total = 0;
      for (const disturbance of disturbances) {
        const age = now - disturbance.time;
        if (age < 0 || age >= DISTURBANCE_DURATION) continue;
        const progress = age / DISTURBANCE_DURATION;
        const distance = Math.hypot(x - disturbance.x, y - disturbance.y);
        const waveDistance = Math.abs(distance - progress * 260);
        if (waveDistance < 80) {
          total += (1 - progress) * disturbance.intensity
            * (1 - waveDistance / 80)
            * Math.sin((distance - progress * 260) * 0.07);
        }
      }
      return total;
    };

    const deform = (x: number, y: number, progress: number, now: number) => {
      const pointerDistance = Math.hypot(x - pointer.x, y - pointer.y);
      const pointerInfluence = Math.max(0, 1 - pointerDistance / 280);
      const disturbance = getDisturbance(x, y, now);
      const waveX = Math.sin(progress * Math.PI * 4 + now * 0.0014) * 12;
      const waveY = Math.sin(progress * Math.PI * 7 - now * 0.0011) * 6;
      const texture = Math.sin(x * 0.02 + y * 0.015 + now * 0.00065) * 3;
      const pointerWave = pointerInfluence * Math.sin(now * 0.0026 + progress * Math.PI * 2) * 13;
      const touchWave = disturbance * Math.sin(now * 0.0018 + progress * Math.PI * 3) * 10;

      return {
        x: waveX + texture + pointerWave + touchWave,
        y: waveY + pointerWave * 0.55 + touchWave * 0.7,
      };
    };

    const draw = (now: number, staticFrame = false) => {
      context.clearRect(0, 0, width, height);
      const isMobile = width < 640;
      const ribbonWidth = width;
      const ribbonOffset = 0;
      const time = staticFrame ? 0 : now;

      context.beginPath();
      context.strokeStyle = BLUE_RIBBON;
      context.lineWidth = isMobile ? 0.7 : 0.8;
      context.lineJoin = 'round';

      for (let column = 0; column <= columns; column += 1) {
        const x = ribbonOffset + (column / columns) * ribbonWidth;
        context.beginPath();
        for (let row = 0; row <= rows; row += 1) {
          const progress = (row / rows) * 1.2 - 0.1;
          const y = progress * height;
          const offset = deform(x, y, progress, time);
          if (row === 0) context.moveTo(x + offset.x, y + offset.y);
          else context.lineTo(x + offset.x, y + offset.y);
        }
        context.stroke();
      }

      for (let row = 0; row <= rows; row += 1) {
        const progress = (row / rows) * 1.2 - 0.1;
        const y = progress * height;
        context.beginPath();
        for (let column = 0; column <= columns; column += 1) {
          const x = ribbonOffset + (column / columns) * ribbonWidth;
          const offset = deform(x, y, progress, time);
          if (column === 0) context.moveTo(x + offset.x, y + offset.y);
          else context.lineTo(x + offset.x, y + offset.y);
        }
        context.stroke();
      }

      if (!staticFrame) {
        disturbances = disturbances.filter((disturbance) => now - disturbance.time < DISTURBANCE_DURATION);
      }
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const isMobile = width < 640;
      const cellSize = isMobile ? 20 : 24;
      columns = Math.max(18, Math.ceil(width / cellSize));
      rows = Math.max(24, Math.ceil(height / cellSize));
      pixelRatio = Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.5);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      draw(performance.now(), reducedMotion.matches);
    };

    const animate = (now: number) => {
      frameId = 0;
      if (document.hidden || reducedMotion.matches) return;
      const frameInterval = width < 640 ? 1000 / 24 : 1000 / 30;
      if (now - lastFrame >= frameInterval) {
        draw(now);
        lastFrame = now;
      }
      frameId = window.requestAnimationFrame(animate);
    };

    const startAnimation = () => {
      if (frameId || document.hidden) return;
      if (reducedMotion.matches) {
        draw(performance.now(), true);
        return;
      }
      frameId = window.requestAnimationFrame(animate);
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      startAnimation();
    };

    const handlePointerDown = (event: PointerEvent) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      if (!reducedMotion.matches) {
        disturbances = [
          ...disturbances,
          { x: pointer.x, y: pointer.y, time: performance.now(), intensity: 1.15 },
        ].slice(-MAX_DISTURBANCES);
      }
      startAnimation();
    };

    const handlePointerLeave = () => {
      pointer.x = -1000;
      pointer.y = -1000;
    };

    const handleVisibility = () => {
      if (document.hidden) {
        if (frameId) window.cancelAnimationFrame(frameId);
        frameId = 0;
      } else {
        startAnimation();
      }
    };

    const handleMotionPreference = () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      frameId = 0;
      startAnimation();
    };

    resize();
    startAnimation();
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave);
    document.addEventListener('visibilitychange', handleVisibility);
    reducedMotion.addEventListener('change', handleMotionPreference);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerleave', handlePointerLeave);
      document.removeEventListener('visibilitychange', handleVisibility);
      reducedMotion.removeEventListener('change', handleMotionPreference);
      if (frameId) window.cancelAnimationFrame(frameId);
      disturbances = [];
    };
  }, []);

  return (
    <div className="interactive-ribbons-layer" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
