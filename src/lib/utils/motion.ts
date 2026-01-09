import { readable } from 'svelte/store';

export const prefersReducedMotion = readable(false, (set) => {
  if (typeof window === 'undefined') return;

  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');

  const update = (event?: MediaQueryListEvent): void => {
    set(event ? event.matches : mq.matches);
  };

  // valor inicial
  update();

  mq.addEventListener('change', update);

  return () => {
    mq.removeEventListener('change', update);
  };
});
