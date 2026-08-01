import { useEffect, useRef, useState } from "react";

/** Animated count-up that starts when scrolled into view. */
export default function Counter({ value, suffix = "", duration = 1600, decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            const eased = value * (1 - Math.pow(1 - p, 3));
            setDisplay(decimals > 0 ? Number(eased.toFixed(decimals)) : Math.round(eased));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value, duration, decimals]);

  return (
    <span ref={ref}>
      {display.toLocaleString("en-IN", {
        minimumFractionDigits: decimals > 0 ? decimals : 0,
        maximumFractionDigits: decimals > 0 ? decimals : 0,
      })}
      {suffix}
    </span>
  );
}
