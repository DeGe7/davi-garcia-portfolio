"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";

type ScrollBaseAnimationProps = {
  children: string;
  baseVelocity?: number;
  clasname?: string;
  classname?: string;
  className?: string;
  scrollDependent?: boolean;
  delay?: number;
};

const wrap = (min: number, max: number, value: number) =>
  ((((value - min) % (max - min)) + (max - min)) % (max - min)) + min;

export function ScrollBaseAnimation({
  children,
  baseVelocity = -5,
  clasname,
  classname,
  className,
  scrollDependent = false,
  delay = 0,
}: ScrollBaseAnimationProps) {
  const prefersReducedMotion = useReducedMotion();
  const [hasStarted, setHasStarted] = useState(delay <= 0);
  const offset = useMotionValue(0);
  const segmentRef = useRef<HTMLSpanElement>(null);
  const segmentWidth = useRef(0);
  const direction = useRef(Math.sign(baseVelocity) || -1);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothScrollVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(
    smoothScrollVelocity,
    [-1000, 0, 1000],
    [-1, 0, 1],
  );
  const x = useTransform(offset, (value) => value);

  useEffect(() => {
    if (delay <= 0 || prefersReducedMotion) return;
    const timeout = window.setTimeout(() => setHasStarted(true), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, prefersReducedMotion]);

  useEffect(() => {
    const segment = segmentRef.current;
    if (!segment) return;

    const measure = () => {
      segmentWidth.current = segment.getBoundingClientRect().width;
    };
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(segment);
    return () => observer.disconnect();
  }, [children, clasname, classname, className]);

  useAnimationFrame((_, delta) => {
    if (!hasStarted || prefersReducedMotion) return;

    const width = segmentWidth.current;
    if (width <= 0) return;

    const currentVelocity = velocityFactor.get();
    if (scrollDependent) {
      if (Math.abs(currentVelocity) > 0.03) {
        direction.current = Math.sign(currentVelocity) * (Math.sign(baseVelocity) || -1);
      }
    } else {
      direction.current = Math.sign(baseVelocity) || -1;
    }

    const scrollBoost = scrollDependent ? 1 + Math.min(Math.abs(currentVelocity), 1) * 3 : 1;
    const nextOffset = offset.get()
      + direction.current * Math.abs(baseVelocity) * scrollBoost * (delta / 1000);
    const wrappedOffset = direction.current < 0
      ? wrap(-width, 0, nextOffset)
      : wrap(0, width, nextOffset);
    offset.set(wrappedOffset);
  });

  const itemClassName = clasname ?? classname ?? className ?? "";
  const repetitions = prefersReducedMotion ? 1 : 4;

  return (
    <div className="scroll-marquee-viewport">
      <span className="sr-only">{children}</span>
      <motion.div className="scroll-marquee-track" style={{ x }} aria-hidden="true">
        {Array.from({ length: repetitions }, (_, index) => (
          <span
            key={`${index}-${children}`}
            ref={index === 0 ? segmentRef : undefined}
            className={`scroll-marquee-item ${itemClassName}`}
          >
            {children}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
