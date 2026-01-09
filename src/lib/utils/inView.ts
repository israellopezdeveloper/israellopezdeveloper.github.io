import { readable, type Readable } from 'svelte/store';

export function inView(
  node: Element,
  options: IntersectionObserverInit = {
    root: null,
    rootMargin: '200px',
    threshold: 0.01
  }
): Readable<boolean> {
  return readable(false, (set) => {
    if (typeof window === 'undefined') return;

    const obs = new IntersectionObserver((entries) => {
      set(entries.some((e) => e.isIntersecting));
    }, options);

    obs.observe(node);

    return () => {
      obs.disconnect();
    };
  });
}
