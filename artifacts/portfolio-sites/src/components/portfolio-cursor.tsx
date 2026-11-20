import { useEffect, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';

const hoverableSelector = 'a, button, input, [data-hover="true"]';

function isHoverable(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest(hoverableSelector));
}

export function PortfolioCursor() {
  const prefersReducedMotion = useReducedMotion();
  const [isClicking, setIsClicking] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const pointerX = useMotionValue(-100);
  const pointerY = useMotionValue(-100);
  const mainX = useSpring(pointerX, { damping: 20, stiffness: 400, mass: 0.5 });
  const mainY = useSpring(pointerY, { damping: 20, stiffness: 400, mass: 0.5 });
  const trailX = useSpring(pointerX, { damping: 30, stiffness: 200, mass: 0.8 });
  const trailY = useSpring(pointerY, { damping: 30, stiffness: 200, mass: 0.8 });
  const glowX = useSpring(pointerX, { damping: 40, stiffness: 150, mass: 1 });
  const glowY = useSpring(pointerY, { damping: 40, stiffness: 150, mass: 1 });

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!finePointer.matches || prefersReducedMotion) return;

    const handleMouseMove = (event: MouseEvent) => {
      pointerX.set(event.clientX);
      pointerY.set(event.clientY);
      setIsVisible(true);
    };
    const handleMouseOver = (event: MouseEvent) => setIsHovering(isHoverable(event.target));
    const handleMouseOut = (event: MouseEvent) => setIsHovering(isHoverable(event.relatedTarget));
    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => {
      setIsVisible(false);
      setIsClicking(false);
      setIsHovering(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    window.addEventListener('mouseout', handleMouseOut, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('blur', handleMouseLeave);
    document.documentElement.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('mouseout', handleMouseOut);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('blur', handleMouseLeave);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [pointerX, pointerY, prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <div className="portfolio-neon-cursor" data-visible={isVisible} aria-hidden="true">
      <motion.span
        className="portfolio-neon-cursor-main"
        style={{ x: mainX, y: mainY }}
        animate={{ scale: isClicking ? 0.8 : isHovering ? 1.2 : 1 }}
        transition={{ type: 'spring', damping: 20, stiffness: 400, mass: 0.5 }}
      />
      <motion.span
        className="portfolio-neon-cursor-trail"
        style={{ x: trailX, y: trailY }}
        animate={{
          scale: isHovering ? 1.5 : 1,
          borderColor: isHovering ? 'rgba(71, 126, 209, .95)' : 'rgba(71, 126, 209, .68)',
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 200, mass: 0.8 }}
      />
      <motion.span
        className="portfolio-neon-cursor-glow"
        style={{ x: glowX, y: glowY }}
        animate={{ scale: isHovering ? 2 : 1, opacity: isHovering ? 0.8 : 0.4 }}
        transition={{ type: 'spring', damping: 40, stiffness: 150, mass: 1 }}
      />
    </div>
  );
}
