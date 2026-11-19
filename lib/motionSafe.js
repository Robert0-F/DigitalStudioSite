/**
 * Motion disabled for enter animations on mobile WebKit reliability.
 * Keep content visible even if IntersectionObserver / FM fails.
 */
export function enterY() {
  return false;
}

export const visibleY = { y: 0 };
