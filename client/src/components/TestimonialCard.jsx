import { memo } from "react";
import { BadgeCheck } from "lucide-react";
import StarRating from "./StarRating";

function TestimonialCard({ item }) {
  const { name = "", role = "", rating = 5, result = "", text = "", photo = "" } = item;
  const initial = (name.trim()[0] || "G").toUpperCase();

  return (
    <article className="relative flex h-full flex-col rounded-[28px] border border-white/15 bg-white/[0.08] p-7 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.55)] backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-2 hover:border-white/25 hover:bg-white/[0.12] hover:shadow-[0_32px_80px_-28px_rgba(0,0,0,0.65)] sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <StarRating rating={rating} size={15} />
        {result && (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-lime px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-ink shadow-soft">
            <BadgeCheck size={13} aria-hidden="true" /> {result}
          </span>
        )}
      </div>

      <blockquote className="mt-6 grow text-[15px] leading-[1.8] text-white/85">
        <p className="line-clamp-3">“{text}”</p>
      </blockquote>

      <footer className="mt-7 flex items-center gap-3.5 border-t border-white/10 pt-6">
        {photo ? (
          <img
            src={photo}
            alt={name}
            loading="lazy"
            className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-white/20"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-lime to-honey font-heading text-lg font-bold text-ink ring-2 ring-white/20"
          >
            {initial}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="truncate font-heading text-[17px] font-semibold text-white">{name}</h3>
          {role && <p className="truncate text-[13px] font-medium text-[#A9C0A0]">{role}</p>}
        </div>
      </footer>
    </article>
  );
}

export default memo(TestimonialCard);
