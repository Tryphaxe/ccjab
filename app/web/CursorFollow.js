'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';

export default function CursorFollow() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(-40);
  const y = useMotionValue(-40);
  const ringX = useSpring(x, { stiffness: 180, damping: 24, mass: 0.35 });
  const ringY = useSpring(y, { stiffness: 180, damping: 24, mass: 0.35 });

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine) and (min-width: 768px)');
    const syncEnabled = () => setIsEnabled(finePointer.matches && !reduceMotion);
    syncEnabled();
    finePointer.addEventListener('change', syncEnabled);
    return () => finePointer.removeEventListener('change', syncEnabled);
  }, [reduceMotion]);

  useEffect(() => {
    if (!isEnabled) return undefined;
    const move = (event) => {
      x.set(event.clientX);
      y.set(event.clientY);
      setIsVisible(true);
      setIsHovering(Boolean(event.target.closest?.('a, button, input, select, textarea, [role="button"]')));
    };
    const leave = () => setIsVisible(false);
    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
    };
  }, [isEnabled, x, y]);

  if (!isEnabled || !isVisible) return null;

  return (
    <>
      <motion.span
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[100] h-8 w-8 rounded-full border border-white/80 mix-blend-difference"
        style={{ x: ringX, y: ringY, marginLeft: -16, marginTop: -16 }}
        animate={{ scale: isHovering ? 1.45 : 1, opacity: isHovering ? 0.95 : 0.65 }}
        transition={{ type: 'spring', stiffness: 240, damping: 20 }}
      />
      <motion.span
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[101] h-1.5 w-1.5 rounded-full bg-white mix-blend-difference"
        style={{ x, y, marginLeft: -3, marginTop: -3 }}
      />
    </>
  );
}
