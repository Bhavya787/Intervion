import { useEffect, useState } from 'react';

/**
 * Eased count from 0 to `end` over `durationMs` when `active` is true (runs once per `active` transition to true).
 */
export function useCountUp(end: number, durationMs: number, active: boolean) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    setValue(0);
    let cancelled = false;
    const start = performance.now();

    const tick = (now: number) => {
      if (cancelled) return;
      const elapsed = now - start;
      const t = Math.min(1, elapsed / durationMs);
      const eased = 1 - (1 - t) ** 3;
      setValue(Math.round(eased * end));
      if (t < 1) requestAnimationFrame(tick);
      else setValue(end);
    };

    const id = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(id);
    };
  }, [active, end, durationMs]);

  return active ? value : 0;
}
