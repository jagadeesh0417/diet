import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, animate, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Reveal from "./Reveal";
import TestimonialCard from "./TestimonialCard";

const GAP = 24;
const AUTOPLAY_MS = 4500;

function usePerPage() {
  const [perPage, setPerPage] = useState(() => {
    if (typeof window === "undefined") return 3;
    if (window.matchMedia("(min-width: 1024px)").matches) return 3;
    if (window.matchMedia("(min-width: 640px)").matches) return 2;
    return 1;
  });

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const tablet = window.matchMedia("(min-width: 640px)");
    const update = () => setPerPage(desktop.matches ? 3 : tablet.matches ? 2 : 1);
    update();
    desktop.addEventListener("change", update);
    tablet.addEventListener("change", update);
    return () => {
      desktop.removeEventListener("change", update);
      tablet.removeEventListener("change", update);
    };
  }, []);

  return perPage;
}

function TestimonialsSection({ items = [] }) {
  const list = useMemo(() => items.filter((t) => t.published !== false), [items]);
  const T = list.length;
  const perPage = usePerPage();
  const reduced = useReducedMotion();
  const carousel = T > perPage;

  const track = useMemo(() => [...list, ...list, ...list], [list]);
  const maxPos = 3 * T - perPage;

  const viewportRef = useRef(null);
  const x = useMotionValue(0);
  const [width, setWidth] = useState(0);
  const [pos, setPos] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const step = width > 0 ? (width - (perPage - 1) * GAP) / perPage + GAP : 0;

  const goTo = useCallback(
    (target, instant = false) => {
      if (step <= 0) return;
      const clamped = Math.max(0, Math.min(target, maxPos));
      const targetX = -clamped * step;
      if (instant || reduced) {
        x.set(targetX);
      } else {
        animate(x, targetX, { duration: 0.55, ease: [0.22, 1, 0.36, 1] });
      }
      setPos(clamped);
    },
    [x, step, maxPos, reduced]
  );

  const next = useCallback(() => {
    if (step <= 0) return;
    const t = pos + 1;
    goTo(t > maxPos ? t - T : t);
  }, [goTo, pos, maxPos, T, step]);

  const prev = useCallback(() => {
    if (step <= 0) return;
    if (pos === 0) {
      x.set(-(2 * T) * step);
      goTo(2 * T - 1);
    } else {
      goTo(pos - 1);
    }
  }, [goTo, pos, T, x, step]);

  useEffect(() => {
    if (!carousel || paused || dragging || !visible || reduced || step <= 0) return;
    const id = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [carousel, paused, dragging, visible, reduced, step, next]);

  useEffect(() => {
    if (step > 0) x.set(-Math.min(pos, maxPos) * step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, perPage]);

  const handleDragEnd = useCallback(
    (_, info) => {
      setDragging(false);
      if (info.offset.x < -60 || info.velocity.x < -500) next();
      else if (info.offset.x > 60 || info.velocity.x > 500) prev();
      else goTo(pos);
    },
    [next, prev, goTo, pos]
  );

  if (T === 0) return null;

  const arrowBase =
    "flex items-center justify-center rounded-full border border-white/15 bg-white/[0.08] text-white backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:bg-white/20 active:scale-95";

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-primary-darker via-[#12392A] to-primary section-pad"
      aria-roledescription="carousel"
      aria-label="Client success stories"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 12% 15%, rgba(163,198,68,0.12) 0%, transparent 45%), radial-gradient(circle at 88% 80%, rgba(255,255,255,0.06) 0%, transparent 40%)",
        }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute -left-28 top-32 h-96 w-96 rounded-full bg-lime/[0.07] blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 bottom-20 h-[26rem] w-[26rem] rounded-full bg-white/[0.05] blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-10 top-24 h-64 w-64 rounded-full border border-white/10" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
        aria-hidden="true"
      />

      <div className="container-x relative z-10">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center sm:mb-14">
          <span className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.08] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#B9CFB0] backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-lime" aria-hidden="true" /> Success Stories
          </span>
          <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-[46px]">
            Real Transformations. <span className="text-lime">Real Results.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-[600px] text-base leading-relaxed text-[#A9C0A0] sm:text-lg">
            Read inspiring journeys from our clients who transformed their health with personalized nutrition plans.
          </p>
        </Reveal>

        {carousel ? (
          <div
            ref={viewportRef}
            className="relative overflow-hidden py-8 -my-8"
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            <motion.div
              className="flex cursor-grab active:cursor-grabbing"
              style={{ x, touchAction: "pan-y" }}
              drag="x"
              dragConstraints={{ left: -(maxPos * step + 160), right: 160 }}
              dragElastic={0.1}
              dragMomentum={false}
              onDragStart={() => setDragging(true)}
              onDragEnd={handleDragEnd}
            >
              {track.map((t, i) => (
                <div
                  key={i}
                  className="h-auto shrink-0"
                  style={{ width: step, paddingRight: i === track.length - 1 ? 0 : GAP }}
                >
                  <TestimonialCard item={t} />
                </div>
              ))}
            </motion.div>

            <button onClick={prev} aria-label="Previous testimonials" className={`${arrowBase} absolute left-0 top-1/2 z-10 hidden -translate-y-1/2 p-3 sm:flex`}>
              <ChevronLeft size={22} />
            </button>
            <button onClick={next} aria-label="Next testimonials" className={`${arrowBase} absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 p-3 sm:flex`}>
              <ChevronRight size={22} />
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-stretch justify-center gap-6">
            {list.map((t) => (
              <div key={t._id} className="w-full sm:w-[calc(50%-12px)] lg:w-[360px]">
                <TestimonialCard item={t} />
              </div>
            ))}
          </div>
        )}

        {carousel && (
          <div className="mt-6 flex items-center justify-center gap-5">
            <button onClick={prev} aria-label="Previous testimonials" className={`${arrowBase} h-9 w-9 sm:hidden`}>
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-2" role="tablist" aria-label="Testimonial slides">
              {list.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === pos % T}
                  aria-label={`Go to testimonial ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={`h-2.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-lime/40 ${
                    i === pos % T ? "w-8 bg-lime" : "w-2.5 bg-white/25 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
            <button onClick={next} aria-label="Next testimonials" className={`${arrowBase} h-9 w-9 sm:hidden`}>
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default memo(TestimonialsSection);
