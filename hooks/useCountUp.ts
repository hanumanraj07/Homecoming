import { useEffect, useRef, useState } from 'react';

// Animates a number climbing from 0 to `target` — used for stat headline numbers. Kept as a
// plain requestAnimationFrame loop rather than RN's Animated API, since Animated has no built-in
// way to tween the text content of a number (only style/transform properties).
export function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0);
  const targetRef = useRef(target);
  targetRef.current = target;

  useEffect(() => {
    let start: number | null = null;
    let frame: number;

    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min(1, (timestamp - start) / duration);
      setValue(Math.round(targetRef.current * progress));
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}
