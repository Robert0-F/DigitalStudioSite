/**
 * Framer Motion helpers that avoid stuck opacity:0 on iOS Safari
 * (IntersectionObserver / reduced-motion / transition nukes).
 * Slide only — opacity stays 1 so content never disappears.
 */

export function enterY(reduceMotion, y = 14) {
  if (reduceMotion) return false;
  return { y };
}

export const visibleY = { y: 0 };
