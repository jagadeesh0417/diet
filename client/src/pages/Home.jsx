import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight, CalendarCheck, Star, ArrowUpRight, BadgeCheck, Camera, Check,
  Leaf, GraduationCap, HeartPulse, Baby, Sparkles,
} from "lucide-react";
import { useSite } from "../context/SiteContext";
import SEO from "../components/SEO";
import Reveal from "../components/Reveal";
import SectionHeading from "../components/SectionHeading";
import BookingSection from "../components/BookingSection";
import { ICON_MAP } from "../utils/helpers";

const TestimonialsSection = lazy(() => import("../components/TestimonialsSection"));

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
  const h = site.homepage || {};
  const seo = site.seo || {};
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 600], [0, -24]);
  const [heroSrc, setHeroSrc] = useState(
    typeof h.heroPortrait === "string" && h.heroPortrait.trim() ? h.heroPortrait : "/hero-banner.png"
  );

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
      <section className="relative overflow-hidden bg-paper pb-16 pt-[100px] sm:pb-20 lg:pt-[120px]">
        <div className="absolute inset-0 bg-hero-pattern" aria-hidden="true" />
        <div className="absolute -right-32 top-24 h-[26rem] w-[26rem] rounded-full bg-olive/10 blur-3xl" aria-hidden="true" />
        <div className="absolute -left-24 bottom-0 h-96 w-96 rounded-full bg-terracotta/10 blur-3xl" aria-hidden="true" />

        <div className="container-x relative z-10">
          <div className="grid w-full items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center lg:text-left"
            >
              {h.heroBadge && (
                <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-olive shadow-card">
                  <BadgeCheck size={15} /> {h.heroBadge}
                </span>
              )}
              <h1 className="mx-auto max-w-[640px] text-[34px] font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:mx-0 lg:text-[64px] xl:text-[68px]">
                {h.heroTitle || "Real food. Real plans. Real results—built around you."}
              </h1>
              <p className="mx-auto mt-5 max-w-[600px] text-base leading-relaxed text-muted sm:text-lg lg:mx-0 lg:text-xl">
                {h.heroSubtitle || "Science-backed, personalized nutrition plans designed to improve your health without giving up the foods you love. Online and in-clinic consultations available."}
              </p>
              <div className="mt-8 flex justify-center lg:justify-start">
                <Link to={h.ctaPrimary?.link || "/contact"} className="btn-terracotta min-w-[200px] lg:min-w-[220px]">
                  <CalendarCheck size={19} /> {h.ctaPrimary?.label || "Book a Consultation"}
                </Link>
              </div>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-5 lg:justify-start">
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
                <div className="text-center lg:text-left">
                  <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-ink lg:justify-start">
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
              className="relative mx-auto w-full max-w-[380px] sm:max-w-[440px] lg:max-w-[480px]"
            >
              <motion.div style={{ y: parallaxY }} className="relative">
                <div className="absolute -inset-5 rounded-[32px] bg-gradient-to-br from-olive/15 via-beige to-terracotta/15 blur-2xl" aria-hidden="true" />
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 5 }}
                  className="relative"
                >
                  <img
                    src={heroSrc}
                    onError={() => setHeroSrc("/hero-banner.png")}
                    alt="Nutritionist preparing a healthy salad"
                    className="aspect-[4/5] h-auto w-full rounded-[180px_180px_22px_22px] object-cover shadow-lift"
                    loading="eager"
                    fetchpriority="high"
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= STATISTICS ================= */}
      <section className="bg-sageLight section-pad">
        <div className="container-x">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {(h.stats || []).map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08}>
                <div className="group flex min-h-[170px] flex-col items-center justify-center rounded-[24px] border border-ink/5 bg-white p-6 text-center shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift">
                  <p className="font-heading text-4xl font-bold tracking-tight text-primary sm:text-5xl">
                    <CountUp value={Number(s.value)} suffix={s.suffix} />
                  </p>
                  <p className="mx-auto mt-2.5 max-w-[200px] text-sm font-medium leading-snug text-muted">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= MEET THE FOUNDER ================= */}
      <section className="overflow-hidden bg-white section-pad">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          {/* Portrait */}
          <Reveal className="relative order-first mx-auto w-full max-w-[520px] lg:order-none lg:max-w-none">
            <div className="absolute -inset-4 rounded-[36px] bg-gradient-to-br from-sage via-sage2/60 to-transparent blur-xl" aria-hidden="true" />
            <div className="relative rounded-[32px] border border-[#E7EBE3] bg-white p-3 shadow-[0_24px_70px_rgba(20,40,30,0.14)]">
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 6 }} className="relative">
                {h.aboutPreview?.image && (
                  <img
                    src={h.aboutPreview.image}
                    alt="Dr. Sushma Appaiah"
                    className="h-[380px] w-full rounded-[24px] object-cover sm:h-[480px] lg:h-[560px]"
                    loading="lazy"
                  />
                )}
              </motion.div>
            </div>

            <div className="absolute -bottom-6 left-5 z-20 flex items-center gap-3 rounded-2xl border border-[#ECEFEA] bg-white px-5 py-4 shadow-[0_16px_40px_rgba(20,40,30,0.16)]">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <GraduationCap size={22} />
              </span>
              <div>
                <p className="font-heading text-2xl font-bold leading-none text-ink">{site.about?.experienceYears || 19}+</p>
                <p className="mt-1 text-xs font-medium text-muted">Years of Experience</p>
              </div>
            </div>

            <div className="absolute -right-3 top-7 z-20 flex items-center gap-2 rounded-full border border-[#ECEFEA] bg-white px-4 py-2.5 shadow-[0_16px_40px_rgba(20,40,30,0.16)] sm:-right-6">
              <Sparkles size={16} className="text-limeDark" />
              <p className="text-sm font-semibold text-ink">
                {(site.about?.specialNeeds?.stat?.value || 3000).toLocaleString("en-IN")}
                {site.about?.specialNeeds?.stat?.suffix || "+"} Diet Plans
              </p>
            </div>
          </Reveal>

          {/* Founder story */}
          <Reveal delay={0.1} className="text-center lg:text-left">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-white shadow-soft">
              <Leaf size={14} /> About the Founder
            </span>
            <h2 className="text-3xl font-bold leading-tight text-ink sm:text-4xl lg:text-[46px]">
              {h.aboutPreview?.title || "Meet Dr. Sushma Appaiah"}
            </h2>
            <p className="mx-auto mt-3 max-w-[560px] text-sm font-semibold uppercase tracking-[0.2em] text-primary lg:mx-0">
              {site.about?.designation || "Founder — Clinical Nutritionist & Wellness Counsellor"}
            </p>

            <div className="mx-auto mt-7 max-w-[640px] space-y-4 rounded-[24px] border border-[#ECEFEA] bg-[#F8FAF7] p-6 text-left sm:p-8 lg:mx-0">
              {(h.aboutPreview?.text || "Dr. Sushma Appaiah is the Founder of GOLZ (Giggles of Livez) and a distinguished nutrition scientist with 19 years of experience in clinical nutrition, corporate wellness, and health counselling.").split(/\n{2,}/).map((para) => (
                <p key={para.slice(0, 24)} className="flex items-start gap-3 text-[15px] leading-[1.8] text-ink/80">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-lime text-ink shadow-[0_4px_12px_rgba(163,198,68,0.5)]">
                    <Check size={13} strokeWidth={3} />
                  </span>
                  <span>{para}</span>
                </p>
              ))}
            </div>

            <div className="mx-auto mt-7 grid max-w-[640px] grid-cols-1 gap-3 text-left sm:grid-cols-2 lg:mx-0">
              {[
                { Icon: GraduationCap, label: "Clinical Nutrition Expert" },
                { Icon: HeartPulse, label: "Lifestyle Disease Management" },
                { Icon: Sparkles, label: "Personalized Diet Plans" },
                { Icon: Baby, label: "Child & Women's Nutrition" },
              ].map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl border border-[#ECEFEA] bg-white p-4 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-lime/15 text-limeDark">
                    <Icon size={19} />
                  </span>
                  <p className="text-sm font-semibold leading-snug text-ink">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Link to={h.aboutPreview?.buttonLink || "/about"} className="btn-primary w-full sm:w-auto sm:min-w-[200px]">
                {h.aboutPreview?.buttonLabel || "Know More"} <ArrowRight size={18} />
              </Link>
              <Link to="/contact" className="btn-outline w-full sm:w-auto sm:min-w-[200px]">
                Book Consultation <ArrowUpRight size={18} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= SERVICES ================= */}
      <section className="bg-white section-pad">
        <div className="container-x">
          <Reveal className="mx-auto max-w-[900px] text-center">
            <span className="mb-6 inline-flex items-center rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              Services
            </span>
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-[46px]">
              Nutrition &amp; Care for Every Stage to Meet Your Goals &amp; Health Needs
            </h2>
            <p className="mx-auto mt-5 max-w-[600px] text-base leading-[1.8] text-muted sm:text-lg">
              From weight management and diabetes care to pregnancy, children's nutrition, sports nutrition, oncology, and healthy aging, every nutrition plan is personalized to your body, goals, medical history, and food preferences.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(site.services || []).map((s, i) => {
              const Icon = ICON_MAP.get(s.icon) || ICON_MAP.get("Sparkles");
              return (
                <Reveal key={s._id} delay={(i % 3) * 0.08} className="h-full">
                  <Link
                    to={`/services/${s.slug}`}
                    className="group flex h-full min-h-[240px] flex-col rounded-[24px] border border-[#ECECEC] bg-white p-7 transition-all duration-300 ease-out hover:-translate-y-2 hover:border-transparent hover:shadow-lift sm:p-8"
                  >
                    <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-transform duration-300 ease-out group-hover:scale-110">
                      {Icon && <Icon size={26} />}
                    </span>
                    <h3 className="text-xl font-bold leading-snug text-ink transition-colors group-hover:text-primary sm:text-2xl">
                      {s.title}
                    </h3>
                    <p className="mt-3 text-[15px] leading-[1.8] text-muted">{s.shortDesc}</p>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="bg-section-sage section-pad">
        <div className="container-x">
          <Reveal className="mx-auto max-w-[820px] text-center">
            <span className="mb-6 inline-flex items-center rounded-full border border-primary/30 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              Steps
            </span>
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-[46px]">
              How It Works
            </h2>
            <p className="mx-auto mt-5 max-w-[600px] text-base leading-[1.8] text-muted sm:text-lg">
              Precision nutrition, step by step — every plan is built on real data about your body and fine-tuned as you progress.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {[
              {
                no: "01",
                title: "Book your appointment",
                text: "Choose online or in-clinic. All consultations are by prior appointment — call or WhatsApp to reserve your slot.",
              },
              {
                no: "02",
                title: "Understand your nutritional profile",
                text: "We map your health, habits and goals with a scientific BCA (Body Composition Analysis), and medical checkups where needed, for a precise picture of your body.",
              },
              {
                no: "03",
                title: "Get a personalized diet plan for you",
                text: "Receive a precision diet plan built specially for you with your preferred foods along with exercise schedules — calibrated to your body, goals and health needs to prevent, manage and reverse disorders.",
              },
              {
                no: "04",
                title: "Progress with regular follow-ups",
                text: "We track your numbers at every follow-up and fine-tune your plan with precision as your body responds.",
              },
            ].map((step, i) => (
              <Reveal key={step.no} delay={i * 0.08}>
                <div className="relative h-full">
                  <p className="text-6xl font-bold leading-none text-primary/15 transition-colors duration-300 hover:text-primary/30">
                    {step.no}
                  </p>
                  <span className="mt-5 block h-px w-12 bg-lime" />
                  <h3 className="mt-4 text-xl font-bold leading-snug text-ink">{step.title}</h3>
                  <p className="mt-3 text-[15px] leading-[1.8] text-muted">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= GALLERY ================= */}
      <section className="section-pad">
        <div className="container-x">
          <SectionHeading
            eyebrow="Gallery"
            title="Moments From Our Journey"
            subtitle="Recipes, workshops, events and real client transformations."
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
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
          <Reveal className="mt-10 text-center">
            <Link to="/gallery" className="btn-primary"><Camera size={18} /> View Gallery</Link>
          </Reveal>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <Suspense fallback={<section className="bg-primary section-pad" aria-hidden="true" />}>
        <TestimonialsSection items={site.testimonials} />
      </Suspense>

      {/* ================= BOOK CONSULTATION ================= */}
      <BookingSection />
    </>
  );
}
