import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight, CalendarCheck, ShieldCheck, ClipboardList, MonitorSmartphone, FlaskConical,
  Star, ArrowUpRight, BadgeCheck, Camera, Apple, Zap, Compass, HeartPulse, CheckCircle2, PieChart, Flame, TrendingUp, Check,
} from "lucide-react";
import { useSite } from "../context/SiteContext";
import SEO from "../components/SEO";
import Reveal from "../components/Reveal";
import SectionHeading from "../components/SectionHeading";
import ServiceCard from "../components/ServiceCard";
import BlogCard from "../components/BlogCard";
import TestimonialSlider from "../components/TestimonialSlider";
import { ICON_MAP } from "../utils/helpers";

const TRUST_ICONS = [ShieldCheck, ClipboardList, MonitorSmartphone, FlaskConical, Star];

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
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 600], [0, -24]);

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
      <section className="relative overflow-hidden bg-cream pb-20 pt-[120px] sm:pb-28 lg:pt-[150px]">
        <div className="absolute inset-0 bg-hero-pattern" aria-hidden="true" />
        <div className="absolute -right-32 top-24 h-[26rem] w-[26rem] rounded-full bg-olive/10 blur-3xl" aria-hidden="true" />
        <div className="absolute -left-24 bottom-0 h-96 w-96 rounded-full bg-terracotta/10 blur-3xl" aria-hidden="true" />

        <div className="container-x relative z-10">
          <div className="grid w-full items-center gap-14 lg:grid-cols-[0.95fr_1.05fr]">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              {h.heroBadge && (
                <span className="mb-7 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-olive shadow-card">
                  <BadgeCheck size={15} /> {h.heroBadge}
                </span>
              )}
              <h1 className="font-heading text-5xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-[68px]">
                {h.heroTitle || "Real food. Real plans. Real results—built around you."}
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
                {h.heroSubtitle || "Science-backed, personalized nutrition plans designed to improve your health without giving up the foods you love. Online and in-clinic consultations available."}
              </p>
              <div className="mt-10">
                <Link to={h.ctaPrimary?.link || "/contact"} className="btn-terracotta">
                  <CalendarCheck size={19} /> {h.ctaPrimary?.label || "Book a Consultation"}
                </Link>
              </div>

              <div className="mt-12 flex flex-wrap items-center gap-5">
                <div className="flex -space-x-3">
                  {[11, 32, 13, 14, 15].map((n) => (
                    <img
                      key={n}
                      src={`https://i.pravatar.cc/96?img=${n}`}
                      alt="Happy client"
                      className="h-11 w-11 rounded-full border-2 border-cream object-cover shadow-card"
                      loading="lazy"
                    />
                  ))}
                </div>
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                    <Star size={16} className="fill-honey text-honey" /> 4.8 Google Rating
                  </p>
                  <p className="mt-0.5 text-sm text-muted">500+ Happy Clients</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="relative mx-auto w-full max-w-md"
            >
              <motion.div style={{ y: parallaxY }} className="relative">
                <div className="absolute -inset-5 rounded-[32px] bg-gradient-to-br from-olive/15 via-beige to-terracotta/15 blur-2xl" aria-hidden="true" />
                {h.heroPortrait ? (
                  <img
                    src={h.heroPortrait}
                    alt="Nutritionist preparing a healthy salad"
                    className="relative aspect-[4/5] w-full rounded-[24px] object-cover shadow-lift"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex aspect-[4/5] w-full items-center justify-center rounded-[24px] border-2 border-dashed border-ink/20">
                    <p className="text-muted">Nutritionist photo — manage from admin panel</p>
                  </div>
                )}

                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 5 }}
                  className="float-card absolute -left-12 top-8 hidden w-44 p-4 lg:block"
                >
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-ink"><PieChart size={13} className="text-terracotta" /> Macro Balance</p>
                  <div className="flex items-center gap-3">
                    <svg viewBox="0 0 100 100" className="h-16 w-16 -rotate-90">
                      <circle cx="50" cy="50" r="34" fill="none" stroke="#EFE9E0" strokeWidth="11" />
                      <circle cx="50" cy="50" r="34" fill="none" stroke="#6E8B5C" strokeWidth="11" strokeDasharray="85.4 213.6" />
                      <circle cx="50" cy="50" r="34" fill="none" stroke="#C97858" strokeWidth="11" strokeDasharray="64.1 213.6" transform="rotate(144 50 50)" />
                      <circle cx="50" cy="50" r="34" fill="none" stroke="#DFA63B" strokeWidth="11" strokeDasharray="64.1 213.6" transform="rotate(252 50 50)" />
                    </svg>
                    <div className="space-y-1 text-[10px] font-medium text-muted">
                      <p className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-olive" />40% Carbs</p>
                      <p className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-terracotta" />30% Protein</p>
                      <p className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-honey" />30% Healthy Fats</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 6 }}
                  className="float-card absolute -right-6 top-1/3 hidden items-center gap-3 px-5 py-4 lg:flex"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-terracotta/10 text-terracotta"><Flame size={22} /></span>
                  <div>
                    <p className="font-heading text-xl font-bold text-ink">450</p>
                    <p className="text-xs text-muted">Calories / meal</p>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 5.5, delay: 0.3 }}
                  className="float-card absolute -left-10 bottom-28 hidden w-48 p-4 lg:block"
                >
                  <p className="mb-2 text-xs font-bold text-ink">Healthy Meal Checklist</p>
                  <ul className="space-y-1.5">
                    {["Balanced Meals", "Whole Foods", "Portion Control", "Healthy Habits"].map((c) => (
                      <li key={c} className="flex items-center gap-1.5 text-[11px] font-medium text-muted">
                        <CheckCircle2 size={13} className="text-olive" /> {c}
                      </li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ repeat: Infinity, duration: 6, delay: 0.6 }}
                  className="float-card absolute -right-4 bottom-8 hidden px-5 py-4 lg:block"
                >
                  <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-ink"><TrendingUp size={13} className="text-terracotta" /> Weekly Progress</p>
                  <svg viewBox="0 0 120 40" className="h-10 w-28">
                    <polyline points="0,32 18,28 36,30 54,22 72,24 90,14 108,10 120,6" fill="none" stroke="#6E8B5C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="120" cy="6" r="3" fill="#C97858" />
                  </svg>
                </motion.div>

                <div className="absolute -right-14 top-1/2 hidden -translate-y-1/2 flex-col gap-3 xl:flex">
                  {[
                    { icon: Apple, label: "Nourish Your Body" },
                    { icon: Zap, label: "Fuel Every Day" },
                    { icon: Compass, label: "Plan with Purpose" },
                    { icon: HeartPulse, label: "Thrive Every Day" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-card ring-1 ring-ink/5">
                      <Icon size={15} className="text-olive" />
                      <span className="text-xs font-semibold text-ink">{label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
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

      {/* ================= STATISTICS ================= */}
      <section className="bg-sageLight py-20 sm:py-24">
        <div className="container-x">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(h.stats || []).map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08}>
                <div className="group rounded-[24px] border border-ink/5 bg-white p-8 text-center shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift">
                  <p className="font-heading text-6xl font-semibold tracking-tight text-primary">
                    <CountUp value={Number(s.value)} suffix={s.suffix} />
                  </p>
                  <p className="mx-auto mt-3 max-w-[220px] text-sm font-medium leading-snug text-muted">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= MEET THE FOUNDER ================= */}
      <section className="bg-white py-24">
        <div className="container-x grid items-center gap-16 lg:grid-cols-2">
          <Reveal className="relative order-first lg:order-none">
            <div className="absolute -inset-4 rounded-[36px] bg-gradient-to-br from-sage via-sage2/60 to-transparent blur-xl" aria-hidden="true" />
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 6 }} className="relative">
              {h.aboutPreview?.image && (
                <img
                  src={h.aboutPreview.image}
                  alt="Dr. Sushma Appaiah"
                  className="aspect-[4/5] w-full rounded-[28px] object-cover shadow-lift"
                  loading="lazy"
                />
              )}
            </motion.div>
          </Reveal>

          <Reveal delay={0.1} className="text-center lg:text-left">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary shadow-card">
              <BadgeCheck size={14} /> About the Founder
            </span>
            <h2 className="font-heading text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              {h.aboutPreview?.title || "Meet Dr. Sushma Appaiah"}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted lg:mx-0">
              {h.aboutPreview?.text || "Dr. Sushma Appaiah is a certified clinical nutritionist with over 20 years of experience helping individuals and families achieve better health through sustainable nutrition. Her approach combines evidence-based science with personalized meal planning to create lasting lifestyle changes."}
            </p>
            <ul className="mx-auto mt-8 grid max-w-xl gap-3 text-left sm:grid-cols-2 lg:mx-0">
              {(h.aboutPreview?.list || [
                "Clinical Nutrition Expert",
                "Lifestyle Disease Management",
                "Personalized Diet Plans",
                "Child & Women's Nutrition Specialist",
              ]).map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm font-semibold text-ink">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime text-ink"><Check size={14} /></span> {item}
                </li>
              ))}
            </ul>
            <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Link to={h.aboutPreview?.buttonLink || "/about"} className="btn-primary w-full sm:w-auto">
                {h.aboutPreview?.buttonLabel || "Know More"} <ArrowRight size={18} />
              </Link>
              <Link to="/contact" className="btn-outline w-full sm:w-auto">
                Book Consultation <ArrowUpRight size={18} />
              </Link>
            </div>
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
