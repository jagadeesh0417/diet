import { memo } from "react";
import { Quote, BadgeCheck } from "lucide-react";
import StarRating from "./StarRating";

function TestimonialCard({ item }) {
  const { name = "", role = "", rating = 5, result = "", text = "", photo = "" } = item;
  const initial = (name.trim()[0] || "G").toUpperCase();

  return (
    <article className="relative flex h-full w-full max-w-[380px] flex-col rounded-[20px] border border-[#EAEAEA] bg-white p-7 shadow-soft transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-card">
      <Quote size={42} strokeWidth={1.4} className="mb-5 text-lime" aria-hidden="true" />

      <header className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          {photo ? (
            <img
              src={photo}
              alt={name}
              loading="lazy"
              className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-primary/15"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark font-heading text-lg font-semibold text-white"
            >
              {initial}
            </span>
          )}
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold text-ink">{name}</h3>
            <p className="truncate text-sm text-muted">{role}</p>
          </div>
        </div>
        <StarRating rating={rating} size={18} />
      </header>

      <blockquote className="mt-5 grow text-base leading-[1.8] text-charcoal/80">
        <p className="line-clamp-5">“{text}”</p>
      </blockquote>

      {result && (
        <span className="mt-6 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-[13px] font-semibold text-white">
          <BadgeCheck size={15} aria-hidden="true" /> {result}
        </span>
      )}
    </article>
  );
}

export default memo(TestimonialCard);
