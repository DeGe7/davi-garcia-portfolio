import { useEffect, useMemo, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { gsap } from 'gsap';

type TextTypeProps = {
  text: readonly string[];
  index: number;
  staticIndex?: number | null;
  typingSpeed: number;
  deletingSpeed: number;
  pauseDuration: number;
};

export function TextType({
  text,
  index,
  staticIndex = null,
  typingSpeed,
  deletingSpeed,
  pauseDuration,
}: TextTypeProps) {
  const prefersReducedMotion = useReducedMotion();
  const [visibleCharacters, setVisibleCharacters] = useState<string[]>([]);
  const visibleCharactersRef = useRef<string[]>([]);
  const previousIndexRef = useRef<number | null>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const textKey = text.join('\u0000');
  const textArray = useMemo(() => textKey.split('\u0000'), [textKey]);
  const staticMode = staticIndex !== null || prefersReducedMotion === true;
  const resolvedIndex = Math.min(Math.max(staticIndex ?? index, 0), textArray.length - 1);
  const targetText = textArray[resolvedIndex] ?? '';

  const updateVisibleCharacters = (characters: string[]) => {
    visibleCharactersRef.current = characters;
    setVisibleCharacters(characters);
  };

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor || staticMode) return;
    const blink = gsap.to(cursor, {
      opacity: 0,
      duration: 0.42,
      repeat: -1,
      yoyo: true,
      repeatDelay: 0.08,
      ease: 'sine.inOut',
    });
    return () => {
      blink.kill();
    };
  }, [staticMode]);

  useEffect(() => {
    const targetCharacters = Array.from(targetText);
    if (staticMode) {
      updateVisibleCharacters(targetCharacters);
      previousIndexRef.current = resolvedIndex;
      return;
    }

    let timer = 0;
    let cancelled = false;
    let currentCharacters = [...visibleCharactersRef.current];
    const typeNextCharacter = () => {
      if (cancelled || currentCharacters.length >= targetCharacters.length) return;
      timer = window.setTimeout(() => {
        currentCharacters = [...currentCharacters, targetCharacters[currentCharacters.length]];
        updateVisibleCharacters(currentCharacters);
        typeNextCharacter();
      }, typingSpeed);
    };
    const deleteNextCharacter = () => {
      if (cancelled) return;
      if (!currentCharacters.length) {
        timer = window.setTimeout(typeNextCharacter, pauseDuration);
        return;
      }
      timer = window.setTimeout(() => {
        currentCharacters = currentCharacters.slice(0, -1);
        updateVisibleCharacters(currentCharacters);
        deleteNextCharacter();
      }, deletingSpeed);
    };

    const isFirstPhrase = previousIndexRef.current === null;
    const samePhrase = previousIndexRef.current === resolvedIndex;
    previousIndexRef.current = resolvedIndex;
    if (isFirstPhrase) typeNextCharacter();
    else if (!samePhrase) deleteNextCharacter();

    return () => window.clearTimeout(timer);
  }, [
    staticMode,
    resolvedIndex,
    targetText,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
  ]);

  return (
    <p className="hero-device-caption" aria-live="polite" aria-atomic="true">
      <span className="sr-only">{targetText}</span>
      <span className="hero-device-caption-visual" aria-hidden="true">
        {visibleCharacters.map((character, characterIndex) => (
          <span className="text-type__char" key={`${resolvedIndex}-${characterIndex}`}>
            {character}
          </span>
        ))}
        {!staticMode && (
          <span ref={cursorRef} className="text-type__cursor">
            |
          </span>
        )}
      </span>
    </p>
  );
}
