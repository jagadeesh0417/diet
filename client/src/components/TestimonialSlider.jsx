import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight, BadgeCheck } from "lucide-react";
import StarRating from "./StarRating";

export default function TestimonialSlider({ items }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || items.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), 6000);
    return () => clearInterval(t);
  }, [paused, items.length]);

  if (!items?.length) return null;
  const item = items[index];

  return (
    <div className="relative mx-auto max-w-4xl" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <AnimatePresence mode="wait">
        <motion.figure
          key={index}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.45 }}
          className="card relative overflow-hidden rounded-[2rem] p-8 sm:p-12"
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/5" />
          <Quote size={56} className="mb-6 text-primary/20" />
          <blockquote className="text-lg leading-relaxed text-charcoal/80 sm:text-xl">“{item.text}”</blockquote>
          {item.result && (
            <span className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
              <BadgeCheck size={16} /> {item.result}
            </span>
          )}
          <figcaption className="mt-6 flex items-center gap-4">
            {item.photo ? (
              <img src={item.photo} alt={item.name} className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/20" loading="lazy" />
            ) : (
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-lg font-bold text-white">{item.name?.[0]}</span>
            )}
            <div>
              <p className="font-heading font-semibold text-charcoal">{item.name}</p>
              <p className="text-sm text-charcoal/50">{item.role}</p>
              <StarRating rating={item.rating} size={14} />
            </div>
          </figcaption>
        </motion.figure>
      </AnimatePresence>

      {items.length > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button onClick={() => setIndex((index - 1 + items.length) % items.length)} className="rounded-full border border-primary/20 p-2.5 text-primary transition hover:bg-primary hover:text-white" aria-label="Previous testimonial">
            <ChevronLeft size={18} />
          </button>
          <div className="flex gap-2">
            {items.map((t, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                className={`h-2.5 rounded-full transition-all ${i === index ? "w-8 bg-primary" : "w-2.5 bg-primary/25 hover:bg-primary/50"}`}
              />
            ))}
          </div>
          <button onClick={() => setIndex((index + 1) % items.length)} className="rounded-full border border-primary/20 p-2.5 text-primary transition hover:bg-primary hover:text-white" aria-label="Next testimonial">
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
