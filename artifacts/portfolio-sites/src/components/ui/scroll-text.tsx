import { useRef } from 'react';
import { motion, useInView, useReducedMotion, type Variants } from 'framer-motion';

type TextAnimationProps = {
  text: string;
  as?: 'h2' | 'p';
  letterAnime?: boolean;
  direction?: 'up' | 'down' | 'left' | 'right';
  classname?: string;
  className?: string;
  highlightWord?: string;
  variants?: Variants;
  testId?: string;
};

const letterVariants: Variants = {
  hidden: { opacity: 0, y: 14, filter: 'blur(3px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
};

function getDirectionVariants(direction?: TextAnimationProps['direction']): Variants {
  const offset = direction === 'down'
    ? { y: -36 }
    : direction === 'up'
      ? { y: 36 }
      : direction === 'right'
        ? { x: 72 }
        : direction === 'left'
          ? { x: -72 }
          : {};

  return {
    hidden: { opacity: 0, ...offset },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: { duration: 0.78, ease: 'easeOut' },
    },
  };
}

export function TextAnimation({
  text,
  as = 'h2',
  letterAnime = false,
  direction,
  classname,
  className,
  highlightWord,
  variants,
  testId,
}: TextAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: 0.25 });
  const prefersReducedMotion = useReducedMotion();
  const Tag = as;
  const revealVariants = letterAnime ? { hidden: {}, visible: {} } : (variants ?? getDirectionVariants(direction));
  const showText = Boolean(prefersReducedMotion) || isInView;
  let letterIndex = 0;

  const letterContent = text.split(/(\s+)/).map((part, partIndex) => {
    if (!part) return null;
    if (/^\s+$/.test(part)) return <span key={`space-${partIndex}`}>{part}</span>;

    const normalizedWord = part.toLocaleLowerCase('pt-BR').replace(/[.,!?;:]+$/g, '');
    const isHighlighted = normalizedWord === highlightWord?.toLocaleLowerCase('pt-BR');

    return (
      <span key={`word-${partIndex}`} className={`scroll-text-word${isHighlighted ? ' scroll-text-highlight-word' : ''}`}>
        {Array.from(part).map((character) => {
          const currentLetter = letterIndex++;
          return (
            <motion.span
              key={`${partIndex}-${currentLetter}`}
              className="scroll-text-letter"
              variants={letterVariants}
              transition={prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.34, delay: currentLetter * 0.022, ease: 'easeOut' }}
            >
              {character}
            </motion.span>
          );
        })}
      </span>
    );
  });

  return (
    <motion.div
      ref={ref}
      className="scroll-text-animation"
      initial={prefersReducedMotion ? false : 'hidden'}
      animate={showText ? 'visible' : 'hidden'}
      variants={revealVariants}
    >
      <Tag className={className ?? classname ?? ''} data-testid={testId}>
        <span className="sr-only">{text}</span>
        <span className="scroll-text-visual" aria-hidden="true">
          {letterAnime ? letterContent : text}
        </span>
      </Tag>
    </motion.div>
  );
}
