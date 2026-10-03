import { useEffect, useRef, type MutableRefObject } from 'react';

/**
 * Returns a MutableRefObject<number> that always holds
 * the current normalized scroll progress (0 → 1).
 */
export function useScrollProgress(): MutableRefObject<number> {
  const progress = useRef(0);

  useEffect(() => {
    const totalHeight = () =>
      document.documentElement.scrollHeight - window.innerHeight;

    const onScroll = () => {
      const h = totalHeight();
      progress.current = h > 0 ? Math.min(window.scrollY / h, 1) : 0;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // init
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return progress;
}
