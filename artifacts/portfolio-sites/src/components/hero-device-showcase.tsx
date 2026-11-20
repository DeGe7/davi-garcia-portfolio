import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { TextType } from '@/components/text-type';

export type HeroDeviceMorphController = {
  beginScrollMorph: () => void;
  setScrollMorphProgress: (progress: number) => void;
  resumeFromMonitor: () => void;
  resumeAutonomous: () => void;
};

type Point = { x: number; y: number };

function roundedRectangleOutline(
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): Point[] {
  const points: Point[] = [{ x: x + width / 2, y }];
  const addArc = (centerX: number, centerY: number, start: number, end: number) => {
    const steps = 10;
    for (let step = 1; step <= steps; step += 1) {
      const angle = (start + ((end - start) * step) / steps) * (Math.PI / 180);
      points.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
      });
    }
  };

  points.push({ x: x + width - radius, y });
  addArc(x + width - radius, y + radius, -90, 0);
  points.push({ x: x + width, y: y + height - radius });
  addArc(x + width - radius, y + height - radius, 0, 90);
  points.push({ x: x + radius, y: y + height });
  addArc(x + radius, y + height - radius, 90, 180);
  points.push({ x, y: y + radius });
  addArc(x + radius, y + radius, 180, 270);
  return points;
}

function resampleOutline(points: Point[], count = 64): Point[] {
  const edges = points.map((point, index) => {
    const next = points[(index + 1) % points.length];
    return {
      start: point,
      end: next,
      length: Math.hypot(next.x - point.x, next.y - point.y),
    };
  });
  const perimeter = edges.reduce((sum, edge) => sum + edge.length, 0);

  return Array.from({ length: count }, (_, index) => {
    let distance = (perimeter * index) / count;
    for (const edge of edges) {
      if (distance <= edge.length) {
        const progress = distance / edge.length;
        return {
          x: edge.start.x + (edge.end.x - edge.start.x) * progress,
          y: edge.start.y + (edge.end.y - edge.start.y) * progress,
        };
      }
      distance -= edge.length;
    }
    return points[0];
  });
}

const deviceOutlines = [
  [
    { x: 250, y: 90 },
    { x: 445, y: 90 },
    { x: 445, y: 310 },
    { x: 275, y: 310 },
    { x: 275, y: 356 },
    { x: 315, y: 378 },
    { x: 365, y: 378 },
    { x: 378, y: 390 },
    { x: 378, y: 402 },
    { x: 122, y: 402 },
    { x: 122, y: 390 },
    { x: 135, y: 378 },
    { x: 225, y: 356 },
    { x: 225, y: 310 },
    { x: 55, y: 310 },
    { x: 55, y: 90 },
  ],
  roundedRectangleOutline(130, 28, 240, 444, 34),
  [
    { x: 250, y: 125 },
    { x: 425, y: 125 },
    { x: 425, y: 345 },
    { x: 440, y: 345 },
    { x: 440, y: 385 },
    { x: 60, y: 385 },
    { x: 60, y: 345 },
    { x: 75, y: 345 },
    { x: 75, y: 125 },
  ],
  roundedRectangleOutline(100, 50, 300, 400, 24),
].map((outline) => resampleOutline(outline));

const deviceCaptions = [
  'Passa confiança.',
  'Facilita o agendamento.',
  'Navegação sem esforço.',
  'Experiência impecável.',
] as const;
const detailsOutDuration = 0.14;
const shapeMorphDuration = 0.9;
const detailsInDuration = 0.16;
const deviceHoldDuration = 1.4;
const captionTypingSpeed = 26;
const captionDeletingSpeed = 12;
const captionPauseDuration = 100;

function devicePathAt(progress: number) {
  const lastIndex = deviceOutlines.length - 1;
  const segment = Math.min(Math.floor(progress), lastIndex);
  const segmentProgress = Math.max(0, Math.min(1, progress - segment));
  const from = deviceOutlines[segment];
  const to = deviceOutlines[(segment + 1) % deviceOutlines.length];
  const points = from.map((point, index) => ({
    x: point.x + (to[index].x - point.x) * segmentProgress,
    y: point.y + (to[index].y - point.y) * segmentProgress,
  }));
  const midpoint = (a: Point, b: Point) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  const first = midpoint(points[points.length - 1], points[0]);
  const path = [`M ${first.x.toFixed(2)} ${first.y.toFixed(2)}`];

  points.forEach((point, index) => {
    const next = points[(index + 1) % points.length];
    const middle = midpoint(point, next);
    path.push(`Q ${point.x.toFixed(2)} ${point.y.toFixed(2)} ${middle.x.toFixed(2)} ${middle.y.toFixed(2)}`);
  });
  path.push('Z');
  return path.join(' ');
}

export function HeroDeviceShowcase({
  onControllerReady,
}: {
  onControllerReady?: (controller: HeroDeviceMorphController | null) => void;
}) {
  const shapeRef = useRef<SVGPathElement>(null);
  const [captionIndex, setCaptionIndex] = useState(0);
  const [captionStaticIndex, setCaptionStaticIndex] = useState<number | null>(null);

  useEffect(() => {
    const shape = shapeRef.current;
    const svg = shape?.ownerSVGElement;
    if (!shape || !svg) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) setCaptionStaticIndex(0);
    const detailGroups = Array.from(svg.querySelectorAll<SVGGElement>('[data-device-details-index]'));
    const detailsAt = (index: number) =>
      detailGroups.filter((group) => Number(group.dataset.deviceDetailsIndex) === index);
    const morph = { progress: 0 };
    const updateShape = () => {
      shape.setAttribute('d', devicePathAt(morph.progress));
    };
    gsap.set(detailGroups, { transformOrigin: '50% 50%', scale: 0.015, opacity: 0 });
    gsap.set(detailsAt(0), { scale: 1, opacity: 1 });
    updateShape();

    const timeline = gsap.timeline({
      repeat: reduceMotion ? 0 : -1,
      yoyo: false,
      repeatDelay: 0,
    });
    timeline.set(morph, { progress: 0, onUpdate: updateShape });
    timeline.to({}, { duration: deviceHoldDuration });
    for (let index = 1; index < deviceOutlines.length; index += 1) {
      const outgoingDetails = detailsAt(index - 1);
      if (outgoingDetails.length) {
        timeline.to(outgoingDetails, {
          scale: 0.015,
          opacity: 0,
          duration: detailsOutDuration,
          ease: 'power3.in',
        });
      }
      timeline.call(() => setCaptionIndex(index));
      timeline.to(morph, {
        progress: index,
        duration: shapeMorphDuration,
        ease: 'power1.inOut',
        onUpdate: updateShape,
      });
      const incomingDetails = detailsAt(index);
      if (incomingDetails.length) {
        timeline.to(incomingDetails, {
          scale: 1,
          opacity: 1,
          duration: detailsInDuration,
          ease: 'power2.out',
        });
      }
      timeline.to({}, { duration: deviceHoldDuration });
    }

    const lastIndex = deviceOutlines.length - 1;
    const outgoingDetails = detailsAt(lastIndex);
    if (outgoingDetails.length) {
      timeline.to(outgoingDetails, {
        scale: 0.015,
        opacity: 0,
        duration: detailsOutDuration,
        ease: 'power3.in',
      });
    }
    timeline.call(() => setCaptionIndex(0));
    timeline.to(morph, {
      progress: deviceOutlines.length,
      duration: shapeMorphDuration,
      ease: 'power1.inOut',
      onUpdate: updateShape,
    });
    const initialDetails = detailsAt(0);
    if (initialDetails.length) {
      timeline.to(initialDetails, {
        scale: 1,
        opacity: 1,
        duration: detailsInDuration,
        ease: 'power2.out',
      });
    }

    let scrollMorphActive = false;
    let scrollMorphStart = 0;
    let scrollMorphEnd = 0;
    let detailSnapshot: Array<{ opacity: number; scale: number }> = [];
    const controller: HeroDeviceMorphController = {
      beginScrollMorph: () => {
        if (scrollMorphActive) return;
        timeline.pause();
        scrollMorphActive = true;
        setCaptionIndex(0);
        setCaptionStaticIndex(0);
        scrollMorphStart = morph.progress;
        const cycleLength = deviceOutlines.length;
        const phase = ((morph.progress % cycleLength) + cycleLength) % cycleLength;
        scrollMorphEnd = phase <= cycleLength / 2 ? 0 : cycleLength;
        detailSnapshot = detailGroups.map((group) => ({
          opacity: Number(gsap.getProperty(group, 'opacity')),
          scale: Number(gsap.getProperty(group, 'scale')),
        }));
      },
      setScrollMorphProgress: (progress) => {
        if (!scrollMorphActive) return;
        const amount = Math.max(0, Math.min(1, progress));
        morph.progress = scrollMorphStart + (scrollMorphEnd - scrollMorphStart) * amount;
        updateShape();
        detailGroups.forEach((group, index) => {
          const from = detailSnapshot[index];
          const isMonitorDetail = Number(group.dataset.deviceDetailsIndex) === 0;
          const toOpacity = isMonitorDetail ? 1 : 0;
          const toScale = isMonitorDetail ? 1 : 0.015;
          gsap.set(group, {
            opacity: from.opacity + (toOpacity - from.opacity) * amount,
            scale: from.scale + (toScale - from.scale) * amount,
          });
        });
      },
      resumeFromMonitor: () => {
        if (!scrollMorphActive) return;
        scrollMorphActive = false;
        detailSnapshot = [];
        setCaptionIndex(0);
        setCaptionStaticIndex(null);
        timeline.restart();
      },
      resumeAutonomous: () => {
        if (!scrollMorphActive) return;
        morph.progress = scrollMorphStart;
        updateShape();
        detailGroups.forEach((group, index) => {
          gsap.set(group, detailSnapshot[index]);
        });
        setCaptionIndex(Math.round(morph.progress) % deviceOutlines.length);
        setCaptionStaticIndex(null);
        scrollMorphActive = false;
        detailSnapshot = [];
        timeline.play();
      },
    };
    onControllerReady?.(controller);

    return () => {
      onControllerReady?.(null);
      timeline.kill();
    };
  }, [onControllerReady]);

  return (
    <div className="hero-device-showcase">
      <div
        className="hero-device-stage"
        role="img"
        aria-label="Um contorno azul que se transforma em monitor 16 por 9, celular 9 por 16, notebook 16 por 10 e tablet 3 por 4."
        data-testid="hero-device-showcase"
      >
        <svg className="hero-morph-svg" viewBox="0 0 500 500" aria-hidden="true">
          <path ref={shapeRef} className="hero-morph-shape" d={devicePathAt(0)} />
          <g className="hero-device-details" data-device-details-index="0">
            <rect className="hero-monitor-power" x="414" y="294" width="18" height="6" rx="3" />
          </g>
          <g className="hero-device-details" data-device-details-index="1">
            <path className="hero-phone-buttons" d="M 130 145 V 184 M 130 198 V 237 M 370 176 V 222" />
            <rect className="hero-phone-island" x="203" y="52" width="94" height="22" rx="11" />
            <circle className="hero-phone-camera" cx="283" cy="63" r="3" />
          </g>
          <g className="hero-device-details" data-device-details-index="2">
            <rect className="hero-laptop-notch" x="240" y="128" width="20" height="5" rx="2" />
            <rect
              className="hero-laptop-touchpad"
              x="205"
              y="351"
              width="90"
              height="24"
              rx="4"
            />
          </g>
          <g className="hero-device-details" data-device-details-index="3">
            <rect className="hero-tablet-speaker" x="232" y="70" width="28" height="4" rx="2" />
            <circle className="hero-tablet-camera" cx="269" cy="72" r="2.5" />
            <circle className="hero-tablet-home" cx="250" cy="426" r="11" />
          </g>
        </svg>
      </div>
      <TextType
        text={deviceCaptions}
        index={captionIndex}
        staticIndex={captionStaticIndex}
        typingSpeed={captionTypingSpeed}
        deletingSpeed={captionDeletingSpeed}
        pauseDuration={captionPauseDuration}
      />
    </div>
  );
}
