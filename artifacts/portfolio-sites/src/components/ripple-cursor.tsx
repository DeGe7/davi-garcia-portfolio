import { useEffect, useReducer, useRef } from 'react';

type Ripple = {
  id: number;
  x: number;
  y: number;
};

type RippleAction =
  | { type: 'ADD_RIPPLE'; payload: Ripple }
  | { type: 'REMOVE_RIPPLE'; payload: number };

function rippleReducer(state: Ripple[], action: RippleAction): Ripple[] {
  switch (action.type) {
    case 'ADD_RIPPLE':
      return [...state, action.payload].slice(-30);
    case 'REMOVE_RIPPLE':
      return state.filter((ripple) => ripple.id !== action.payload);
    default:
      return state;
  }
}

type RippleCursorProps = {
  maxSize?: number;
  duration?: number;
  blur?: boolean;
};

export function RippleCursor({ maxSize = 50, duration = 1000, blur = true }: RippleCursorProps) {
  const [ripples, dispatch] = useReducer(rippleReducer, []);
  const nextId = useRef(0);

  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!finePointer.matches || reducedMotion.matches) return;

    let lastRippleAt = 0;
    const timers = new Map<number, ReturnType<typeof setTimeout>>();

    const handleMouseMove = (event: MouseEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest('input, textarea, select, [contenteditable="true"]')) return;

      // Keep the trail fluid without rendering a new ripple for every hardware event.
      const now = performance.now();
      if (now - lastRippleAt < 38) return;
      lastRippleAt = now;

      const id = nextId.current++;
      dispatch({
        type: 'ADD_RIPPLE',
        payload: { id, x: event.clientX, y: event.clientY },
      });

      timers.set(id, setTimeout(() => {
        dispatch({ type: 'REMOVE_RIPPLE', payload: id });
        timers.delete(id);
      }, duration));
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, [duration]);

  return (
    <div className="ripple-cursor-layer" aria-hidden="true">
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="ripple-cursor-wave"
          style={{
            left: `${ripple.x}px`,
            top: `${ripple.y}px`,
            width: `${maxSize}px`,
            height: `${maxSize}px`,
            animationDuration: `${duration}ms`,
            filter: blur ? 'blur(4px)' : 'none',
          }}
        />
      ))}
    </div>
  );
}
