import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, CalendarCheck, ShieldCheck, ClipboardList, MonitorSmartphone, FlaskConical,
  Star, ArrowUpRight, BadgeCheck, Camera, MapPin,
} from "lucide-react";
import { useSite } from "../context/SiteContext";
import SEO from "../components/SEO";
import Reveal from "../components/Reveal";
import SectionHeading from "../components/SectionHeading";
import ServiceCard from "../components/ServiceCard";
import BlogCard from "../components/BlogCard";
import TestimonialSlider from "../components/TestimonialSlider";
import LazyImage from "../components/LazyImage";
import { ICON_MAP } from "../utils/helpers";

const TRUST_ICONS = [ShieldCheck, ClipboardList, MonitorSmartphone, FlaskConical, Star];

const AVATARS = [
  "https://i.pravatar.cc/96?img=32",
  "https://i.pravatar.cc/96?img=12",
  "https://i.pravatar.cc/96?img=20",
  "https://i.pravatar.cc/96?img=45",
  "https://i.pravatar.cc/96?img=15",
];

function CountUp({ value, suffix = "" }) {
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
          const duration = 1600;
          const start = performance.now();
          const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            setDisplay(Math.round(value * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);

  return (
    <span ref={ref}>
      {display.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

export default function Home() {
  const { site } = useSite();
  const navigate = useNavigate();
  const h = site.homepage || {};
  const seo = site.seo || {};

  const heroTitle = h.heroTitle || "Transform Your Health Through Personalized Nutrition";
  const heroTitleParts = (() => {
    const i = heroTitle.indexOf("—");
    return i === -1 ? null : [heroTitle.slice(0, i + 1), heroTitle.slice(i + 1).trim()];
  })();

  return (
    <>
      <SEO
        title={seo.metaTitle}
        description={seo.metaDescription}
        image={seo.ogImage}
        keywords={seo.keywords}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "MedicalClinic",
          name: site.general?.clinicName,
          description: h.heroSubtitle,
          address: { "@type": "PostalAddress", streetAddress: site.general?.address },
          telephone: site.general?.phone,
        }}
      />

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-paper pb-16 pt-[120px] sm:pb-20 lg:pt-[150px]">
        <div className="absolute inset-0 bg-hero-pattern" aria-hidden="true" />
        <div className="absolute -right-40 top-40 h-[28rem] w-[28rem] rounded-full bg-sage blur-3xl" aria-hidden="true" />
        <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-sage2/60 blur-3xl" aria-hidden="true" />

        <div className="container-x relative z-10">
          <div className="grid w-full items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              {h.heroBadge && (
                <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary backdrop-blur">
                  <MapPin size={15} /> {h.heroBadge}
                </span>
              )}
              <h1 className="text-ink font-heading text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-[68px]">
                {heroTitleParts ? (
                  <>
                    {heroTitleParts[0]}{" "}
                    <em className="font-heading italic text-primary">{heroTitleParts[1]}</em>
                  </>
                ) : (
                  heroTitle
                )}
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
                {h.heroSubtitle || "Evidence-based nutrition plans tailored for your lifestyle, health goals, and medical conditions."}
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link to={h.ctaPrimary?.link || "/contact"} className="btn-primary">
                  <CalendarCheck size={19} /> {h.ctaPrimary?.label || "Book a Consultation"}
                </Link>
                {h.ctaSecondary?.label && (
                  <Link to={h.ctaSecondary.link || "/services"} className="btn-outline">
                    <ArrowRight size={19} /> {h.ctaSecondary.label}
                  </Link>
                )}
              </div>

              <div className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-5">
                <div className="flex items-center">
                  <div className="flex -space-x-3">
                    {AVATARS.map((a) => (
                      <img
                        key={a}
                        src={a}
                        alt="Happy GOLZ client"
                        loading="lazy"
                        className="h-11 w-11 rounded-full object-cover shadow-sm ring-[3px] ring-white"
                      />
                    ))}
                  </div>
                  <p className="ml-4 flex items-center gap-1.5 font-heading text-lg font-semibold text-ink">
                    4.8 <Star size={17} className="fill-honey text-honey" />
                    <span className="text-sm font-medium text-muted">Google Rating</span>
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="relative mx-auto hidden w-full max-w-md lg:block"
            >
              {h.heroPortrait ? (
                <div className="relative">
                  <div className="absolute -inset-6 rounded-[200px_200px_40px_40px] bg-gradient-to-br from-sage via-sage2 to-lime/25 blur-2xl" aria-hidden="true" />
                  <img
                    src={h.heroPortrait}
                    alt="Professional nutritionist"
                    className="relative aspect-[4/5] w-full rounded-[180px_180px_22px_22px] object-cover shadow-lift"
                  />
                  <motion.div
                    animate={{ y: [0, -12, 0] }}
                    transition={{ repeat: Infinity, duration: 5 }}
                    className="glass absolute -left-10 bottom-12 rounded-[18px] px-6 py-4 shadow-card"
                  >
                    <p className="font-heading text-2xl font-semibold text-primary"><CountUp value={Number(h.stats?.[0]?.value || 5000)} suffix={h.stats?.[0]?.suffix || "+"} /></p>
                    <p className="text-xs text-muted">{h.stats?.[0]?.label || "Happy Clients"}</p>
                  </motion.div>
                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 6 }}
                    className="glass absolute -right-8 top-12 rounded-[18px] px-6 py-4 shadow-card"
                  >
                    <p className="flex items-center gap-1 font-heading text-2xl font-semibold text-ink">4.8 <Star size={18} className="fill-honey text-honey" /></p>
                    <p className="text-xs text-muted">Google Rating</p>
                  </motion.div>
                </div>
              ) : (
                <div className="flex aspect-[4/5] w-full items-center justify-center rounded-[180px_180px_22px_22px] border-2 border-dashed border-ink/20">
                  <p className="text-muted">Nutritionist photo — manage from admin panel</p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= TRUST ================= */}
      <section className="relative -mt-14 z-20 container-x">
        <Reveal className="card grid grid-cols-2 gap-6 rounded-3xl p-8 shadow-lift sm:grid-cols-3 lg:grid-cols-5">
          {(h.trustItems || []).map((t, i) => {
            const Icon = TRUST_ICONS[i % TRUST_ICONS.length];
            return (
              <motion.div key={t.title} whileHover={{ y: -6 }} className="group flex flex-col items-center gap-3 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
                  <Icon size={26} />
                </span>
                <div>
                  <p className="font-heading text-sm font-semibold text-charcoal">✔ {t.title}</p>
                  <p className="mt-0.5 text-xs text-charcoal/50">{t.text}</p>
                </div>
              </motion.div>
            );
          })}
        </Reveal>
      </section>

      {/* ================= ABOUT PREVIEW ================= */}
      <section className="py-24">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <Reveal className="relative">
            <div className="absolute -left-6 -top-6 h-40 w-40 rounded-3xl bg-sage/40" />
            <div className="absolute -bottom-8 -right-6 h-52 w-52 rounded-full bg-primary/10 blur-xl" />
            {h.aboutPreview?.image && (
              <img src={h.aboutPreview.image} alt="Nutritionist portrait" className="relative z-10 aspect-[4/3] w-full rounded-[2rem] object-cover shadow-lift" loading="lazy" />
            )}
            <div className="glass absolute -bottom-6 left-8 z-20 flex items-center gap-3 rounded-2xl px-6 py-4 shadow-card">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-lime text-ink"><BadgeCheck size={24} /></span>
              <div>
                <p className="font-heading text-lg font-bold text-charcoal">12+ Years</p>
                <p className="text-xs text-charcoal/60">Clinical Experience</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <SectionHeading center={false} eyebrow="About Me" title={h.aboutPreview?.title || "Meet Your Nutritionist"} />
            <p className="mb-8 text-base leading-relaxed text-charcoal/65">
              {h.aboutPreview?.text || "Certified clinical nutritionist helping people transform their health."}
            </p>
            <ul className="mb-9 grid gap-3 sm:grid-cols-2">
              {["Personalized meal plans", "Medical nutrition therapy", "Online & clinic consultations", "Long-term habit coaching"].map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm font-medium text-charcoal/75">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary">✔</span> {f}
                </li>
              ))}
            </ul>
            <Link to={h.aboutPreview?.buttonLink || "/about"} className="btn-primary">
              {h.aboutPreview?.buttonLabel || "Read More"} <ArrowRight size={18} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ================= SERVICES PREVIEW ================= */}
      <section className="bg-section-sage py-24">
        <div className="container-x">
          <SectionHeading
            eyebrow="What We Offer"
            title="Nutrition Programs For Every Goal"
            subtitle="Science-backed programs designed around your health condition, lifestyle and food preferences."
          />
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {(site.services || []).slice(0, 8).map((s, i) => (
              <Reveal key={s._id} delay={(i % 4) * 0.08}>
                <ServiceCard service={s} />
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-12 text-center">
            <Link to="/services" className="btn-outline">View All Services <ArrowUpRight size={18} /></Link>
          </Reveal>
        </div>
      </section>

      {/* ================= WHY CHOOSE US ================= */}
      <section className="py-24">
        <div className="container-x grid items-center gap-16 lg:grid-cols-2">
          <div>
            <SectionHeading
              center={false}
              eyebrow="Why Choose Us"
              title="Care That Actually Gets You Results"
              subtitle="We combine medical science, real-world practicality and genuine human support."
            />
            <div className="grid gap-5 sm:grid-cols-2">
              {(h.whyChooseUs || []).map((w, i) => {
                const Icon = ICON_MAP.get(w.icon) || ICON_MAP.get("Sparkles");
                return (
                  <Reveal key={w.title} delay={(i % 2) * 0.1}>
                    <div className="group card flex gap-4 p-6 hover:shadow-lift">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
                        {Icon && <Icon size={23} />}
                      </span>
                      <div>
                        <h3 className="mb-1 font-heading text-base font-semibold text-charcoal">{w.title}</h3>
                        <p className="text-sm leading-relaxed text-charcoal/60">{w.text}</p>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>

          <Reveal delay={0.15} className="relative">
            <div className="overflow-hidden rounded-[2rem] shadow-lift">
              <img src={h.heroImage || h.cta?.image} alt="Healthy nutrition" className="aspect-[4/5] w-full object-cover" loading="lazy" />
            </div>
            <div className="glass absolute -bottom-8 -left-6 max-w-xs rounded-2xl p-6 shadow-card">
              <p className="font-heading text-lg font-bold text-charcoal">98% Success Rate</p>
              <p className="mt-1 text-sm text-charcoal/60">of clients hit their health milestone within the promised timeframe.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= SUCCESS STORIES ================= */}
      <section className="bg-primary py-24">
        <div className="container-x">
          <SectionHeading
            light
            eyebrow="Success Stories"
            title="Real People. Real Transformations."
            subtitle="Before and after journeys from clients who trusted the process."
          />
          <TestimonialSlider items={site.testimonials} />
        </div>
      </section>

      {/* ================= GALLERY PREVIEW ================= */}
      <section className="py-24">
        <div className="container-x">
          <SectionHeading
            eyebrow="Gallery"
            title="Moments From Our Journey"
            subtitle="Recipes, workshops, events and real client transformations."
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {site.gallery.slice(0, 8).map((g, i) => (
              <Reveal key={g._id} delay={(i % 4) * 0.06}>
                <Link to="/gallery" className="group relative block overflow-hidden rounded-2xl" aria-label={`View ${g.caption || "gallery item"}`}>
                  {g.type === "video" ? (
                    <video src={g.url} muted className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <img src={g.url} alt={g.alt || g.caption} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  )}
                  <span className="absolute inset-0 bg-gradient-to-t from-charcoal/70 to-transparent opacity-0 transition group-hover:opacity-100" />
                  {g.caption && (
                    <span className="absolute bottom-3 left-3 right-3 translate-y-2 text-xs font-medium text-white opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                      {g.caption}
                    </span>
                  )}
                </Link>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-12 text-center">
            <Link to="/gallery" className="btn-primary"><Camera size={18} /> View Gallery</Link>
          </Reveal>
        </div>
      </section>

      {/* ================= LATEST BLOGS ================= */}
      <section className="bg-section-sage py-24">
        <div className="container-x">
          <SectionHeading
            eyebrow="From The Blog"
            title="Latest Nutrition Insights"
            subtitle="Practical, evidence-based articles written by our team."
          />
          <div className="grid gap-7 md:grid-cols-3">
            {site.blogs.map((b, i) => (
              <Reveal key={b._id} delay={i * 0.1}>
                <BlogCard blog={b} />
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-12 text-center">
            <Link to="/blog" className="btn-outline">Visit Blog <ArrowUpRight size={18} /></Link>
          </Reveal>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="relative overflow-hidden py-24">
        {h.cta?.image && (
          <div className="absolute inset-0">
            <img src={h.cta.image} alt="" className="h-full w-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary-darker/95 via-primary/85 to-primary/70" />
          </div>
        )}
        <div className="container-x relative z-10 text-center">
          <Reveal>
            <h2 className="mx-auto max-w-3xl text-3xl font-bold leading-tight text-white sm:text-5xl">
              {h.cta?.title || "Ready to Start Your Health Journey?"}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-white/80">{h.cta?.subtitle || "Book your consultation today."}</p>
            <div className="mt-9">
              <button onClick={() => navigate(h.cta?.buttonLink || "/contact")} className="btn-gold !bg-white !text-primary hover:!bg-offwhite">
                {h.cta?.buttonLabel || "Book Now"} <ArrowRight size={18} />
              </button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
