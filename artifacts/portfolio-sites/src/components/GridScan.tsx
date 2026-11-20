import { useEffect, useRef } from 'react';

type GridScanProps = {
  linesColor?: string;
  scanColor?: string;
  cells?: number;
  depth?: number;
  scanDuration?: number;
  scanDelay?: number;
  clickEffect?: 'ping' | 'none';
  className?: string;
};

type Ping = { x: number; y: number; startedAt: number };

function withAlpha(color: string, alpha: number) {
  const match = color.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) return color;

  const value = match[1].length === 3
    ? match[1].split('').map((part) => part + part).join('')
    : match[1];
  const red = Number.parseInt(value.slice(0, 2), 16);
  const green = Number.parseInt(value.slice(2, 4), 16);
  const blue = Number.parseInt(value.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export default function GridScan({
  linesColor = '#4d4757',
  scanColor = '#7dd3fc',
  cells = 8,
  depth = 3,
  scanDuration = 2.4,
  scanDelay = 1.6,
  clickEffect = 'ping',
  className = '',
}: GridScanProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: true });
    if (!layer || !canvas || !context) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pings: Ping[] = [];
    let frameId = 0;
    let lastFrame = 0;
    let startedAt = performance.now();
    let width = 0;
    let height = 0;
    let pixelRatio = 1;

    const cellSize = () => Math.max(
      18,
      Math.min(32, Math.min(width, height) / (Math.max(1, cells) * 4)),
    );

    const distort = (x: number, y: number, time: number, scanY: number, scanning: boolean) => {
      const nx = x / Math.max(1, width);
      const ny = y / Math.max(1, height);
      const lens = Math.sin(nx * Math.PI) * Math.sin(ny * Math.PI);
      const scanWave = scanning ? Math.exp(-(((y - scanY) / 84) ** 2)) : 0;
      return {
        x: x
          + Math.sin(ny * 4.2 + time * 0.24 + nx * 1.7) * depth * 1.5
          + (nx - 0.5) * lens * depth * 8
          + Math.sin(nx * 7 + time * 0.45) * scanWave * depth * 1.5,
        y: y
          + Math.sin(nx * 4.6 - time * 0.2 + ny * 1.3) * depth * 1.4
          + (ny - 0.5) * lens * depth * 5
          + Math.cos(ny * 8 - time * 0.4) * scanWave * depth * 2,
      };
    };

    const drawGrid = (
      now: number,
      scanY: number,
      scanning: boolean,
      strokeColor: string,
      lineWidth: number,
    ) => {
      const spacing = cellSize();
      const time = (now - startedAt) / 1000;
      context.strokeStyle = strokeColor;
      context.lineWidth = lineWidth;
      context.lineJoin = 'round';

      for (let x = 0; x <= width + spacing; x += spacing) {
        context.beginPath();
        for (let y = -spacing; y <= height + spacing; y += 10) {
          const point = distort(x, y, time, scanY, scanning);
          if (y === -spacing) context.moveTo(point.x, point.y);
          else context.lineTo(point.x, point.y);
        }
        context.stroke();
      }

      for (let y = 0; y <= height + spacing; y += spacing) {
        context.beginPath();
        for (let x = -spacing; x <= width + spacing; x += 10) {
          const point = distort(x, y, time, scanY, scanning);
          if (x === -spacing) context.moveTo(point.x, point.y);
          else context.lineTo(point.x, point.y);
        }
        context.stroke();
      }
    };

    const draw = (now: number, staticFrame = false) => {
      context.clearRect(0, 0, width, height);
      if (!width || !height) return;

      const cycle = Math.max(0.5, scanDuration + scanDelay);
      const cycleTime = ((now - startedAt) / 1000) % cycle;
      const scanning = !staticFrame && cycleTime < scanDuration;
      const scanY = scanning ? (cycleTime / scanDuration) * height : -1000;

      drawGrid(now, scanY, scanning, withAlpha(linesColor, 0.14), 0.8);

      if (scanning) {
        const glow = context.createLinearGradient(0, scanY - 58, 0, scanY + 58);
        glow.addColorStop(0, withAlpha(scanColor, 0));
        glow.addColorStop(0.5, withAlpha(scanColor, 0.2));
        glow.addColorStop(1, withAlpha(scanColor, 0));
        context.fillStyle = glow;
        context.fillRect(0, scanY - 58, width, 116);

        context.save();
        context.beginPath();
        context.rect(0, scanY - 34, width, 68);
        context.clip();
        drawGrid(now, scanY, true, withAlpha(scanColor, 0.36), 1);
        context.restore();

        context.beginPath();
        context.moveTo(0, scanY);
        context.lineTo(width, scanY);
        context.strokeStyle = withAlpha(scanColor, 0.62);
        context.lineWidth = 1;
        context.shadowBlur = 16;
        context.shadowColor = scanColor;
        context.stroke();
        context.shadowBlur = 0;
      }

      if (!staticFrame && clickEffect === 'ping') {
        for (let index = pings.length - 1; index >= 0; index -= 1) {
          const ping = pings[index];
          const progress = (now - ping.startedAt) / 850;
          if (progress >= 1) {
            pings.splice(index, 1);
            continue;
          }
          context.beginPath();
          context.arc(ping.x, ping.y, 9 + progress * 58, 0, Math.PI * 2);
          context.strokeStyle = withAlpha(scanColor, (1 - progress) * 0.72);
          context.lineWidth = 1.5;
          context.shadowBlur = 15;
          context.shadowColor = scanColor;
          context.stroke();
          context.shadowBlur = 0;
        }
      }
    };

    const resize = () => {
      const bounds = layer.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      pixelRatio = Math.min(window.devicePixelRatio || 1, width < 640 ? 1.25 : 1.5);
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

    const handlePointerDown = (event: PointerEvent) => {
      if (clickEffect !== 'ping' || reducedMotion.matches) return;
      const bounds = layer.getBoundingClientRect();
      if (
        event.clientX < bounds.left || event.clientX > bounds.right
        || event.clientY < bounds.top || event.clientY > bounds.bottom
      ) return;
      pings.push({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
        startedAt: performance.now(),
      });
      if (pings.length > 4) pings.shift();
      startAnimation();
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
      startedAt = performance.now();
      startAnimation();
    };

    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(resize);
    resizeObserver?.observe(layer);
    if (!resizeObserver) window.addEventListener('resize', resize, { passive: true });

    const intersectionObserver = typeof IntersectionObserver === 'undefined'
      ? null
      : new IntersectionObserver(([entry]) => {
        document.body.classList.toggle('hero-gridscan-active', entry.isIntersecting);
      });
    intersectionObserver?.observe(layer);
    if (!intersectionObserver) document.body.classList.add('hero-gridscan-active');

    resize();
    startAnimation();
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);
    reducedMotion.addEventListener('change', handleMotionPreference);

    return () => {
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      if (!resizeObserver) window.removeEventListener('resize', resize);
      window.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('visibilitychange', handleVisibility);
      reducedMotion.removeEventListener('change', handleMotionPreference);
      if (frameId) window.cancelAnimationFrame(frameId);
      document.body.classList.remove('hero-gridscan-active');
      pings.length = 0;
    };
  }, [cells, clickEffect, depth, linesColor, scanColor, scanDelay, scanDuration]);

  return (
    <div ref={layerRef} className={`grid-scan hero-grid-scan ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="grid-scan-canvas" />
    </div>
  );
}
