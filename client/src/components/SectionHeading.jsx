import Reveal from "./Reveal";

export default function SectionHeading({ eyebrow, title, subtitle, center = true, light = false }) {
  return (
    <Reveal className={`${center ? "mx-auto text-center" : ""} mb-12 max-w-3xl`}>
      {eyebrow && (
        <span className={`mb-3 inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest ${light ? "bg-white/15 text-[#EEF3EA]" : "bg-primary/10 text-primary"}`}>
          {eyebrow}
        </span>
      )}
      <h2 className={`text-3xl font-semibold leading-tight sm:text-4xl lg:text-[46px] lg:leading-[1.1] ${light ? "text-[#EEF3EA]" : "text-ink"}`}>{title}</h2>
      {subtitle && <p className={`mx-auto mt-4 max-w-[600px] text-base leading-relaxed sm:text-lg ${light ? "text-[#9FB4A5]" : "text-muted"}`}>{subtitle}</p>}
    </Reveal>
  );
}
