import { memo } from "react";
import SectionHeading from "./SectionHeading";
import Reveal from "./Reveal";
import TestimonialCard from "./TestimonialCard";

function TestimonialsSection({ items = [] }) {
  if (!items.length) return null;

  return (
    <section className="relative overflow-hidden bg-primary py-24">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(circle at 15% 20%, rgba(255,255,255,0.07) 0%, transparent 45%), radial-gradient(circle at 85% 80%, rgba(163,198,68,0.09) 0%, transparent 50%)" }}
        aria-hidden="true"
      />
      <div className="pointer-events-none absolute -left-28 top-16 h-72 w-72 rounded-full border border-white/10" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full border border-white/10" aria-hidden="true" />
      <div className="pointer-events-none absolute right-1/4 top-8 h-3 w-3 rounded-full bg-lime/25" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-16 left-1/4 h-2 w-2 rounded-full bg-white/20" aria-hidden="true" />

      <div className="container-x relative z-10">
        <SectionHeading
          light
          eyebrow="Success Stories"
          title="Real People. Real Transformations."
          subtitle="Before and after journeys from clients who trusted the process."
        />
        <ul className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t, i) => (
            <Reveal key={t._id || i} delay={(i % 3) * 0.12} className="flex justify-center">
              <li className="w-full max-w-[380px]">
                <TestimonialCard item={t} />
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default memo(TestimonialsSection);
