import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight, CalendarCheck, ShieldCheck, ClipboardList, MonitorSmartphone, FlaskConical,
  Star, ArrowUpRight, BadgeCheck, Camera, Check,
} from "lucide-react";
import { useSite } from "../context/SiteContext";
import SEO from "../components/SEO";
import Reveal from "../components/Reveal";
import SectionHeading from "../components/SectionHeading";
import { ICON_MAP } from "../utils/helpers";

const TestimonialsSection = lazy(() => import("../components/TestimonialsSection"));

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
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 5 }}
                  className="relative"
                >
                  {h.heroPortrait ? (
                    <img
                      src={h.heroPortrait}
                      alt="Nutritionist preparing a healthy salad"
                      className="w-full rounded-[24px] object-cover shadow-lift"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex aspect-[4/5] w-full items-center justify-center rounded-[24px] border-2 border-dashed border-ink/20">
                      <p className="text-muted">Nutritionist photo — manage from admin panel</p>
                    </div>
                  )}
                </motion.div>
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
            <div className="mx-auto mt-5 max-w-xl space-y-4 text-base leading-relaxed text-muted lg:mx-0">
              {(h.aboutPreview?.text || "Dr. Sushma Appaiah is the Founder of GOLZ (Giggles of Livez) and a distinguished nutrition scientist with 19 years of experience in clinical nutrition, corporate wellness, and health counselling.").split(/\n{2,}/).map((para) => (
                <p key={para.slice(0, 24)}>{para}</p>
              ))}
            </div>
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

      {/* ================= SERVICES ================= */}
      <section className="bg-white py-24 sm:py-32">
        <div className="container-x">
          <Reveal className="mx-auto max-w-[900px] text-center">
            <span className="mb-6 inline-flex items-center rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              Services
            </span>
            <h2 className="font-heading text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
              Nutrition &amp; Care for Every Stage to Meet Your Goals &amp; Health Needs
            </h2>
            <p className="mx-auto mt-6 max-w-[820px] text-base leading-[1.8] text-muted sm:text-[17px]">
              From weight management and diabetes care to pregnancy, children's nutrition, sports nutrition, oncology, and healthy aging, every nutrition plan is personalized to your body, goals, medical history, and food preferences.
            </p>
          </Reveal>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {(site.services || []).map((s, i) => {
              const Icon = ICON_MAP.get(s.icon) || ICON_MAP.get("Sparkles");
              return (
                <Reveal key={s._id} delay={(i % 3) * 0.08} className="h-full">
                  <Link
                    to={`/services/${s.slug}`}
                    className="group flex min-h-[280px] flex-col rounded-[24px] border border-[#ECECEC] bg-white p-8 transition-all duration-300 ease-out hover:-translate-y-2 hover:border-transparent hover:shadow-lift"
                  >
                    <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-transform duration-300 ease-out group-hover:scale-110">
                      {Icon && <Icon size={26} />}
                    </span>
                    <h3 className="font-heading text-2xl font-semibold leading-snug text-ink transition-colors group-hover:text-primary">
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
      <section className="bg-section-sage py-24 sm:py-32">
        <div className="container-x">
          <Reveal className="mx-auto max-w-[820px] text-center">
            <span className="mb-6 inline-flex items-center rounded-full border border-primary/30 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              Steps
            </span>
            <h2 className="font-heading text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">
              How It Works
            </h2>
            <p className="mx-auto mt-6 max-w-[700px] text-base leading-[1.8] text-muted sm:text-[17px]">
              Precision nutrition, step by step — every plan is built on real data about your body and fine-tuned as you progress.
            </p>
          </Reveal>

          <div className="mt-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {[
              {
                no: "01",
                title: "Book your appointment",
                text: "Choose online or in-clinic. All consultations are by prior appointment — call or WhatsApp to reserve your slot.",
              },
              {
                no: "02",
                title: "Understand where you stand",
                text: "We map your health, habits and goals with a scientific BCA (Body Composition Analysis), and medical checkups where needed, for a precise picture of your body.",
              },
              {
                no: "03",
                title: "Get a personalized plan for you",
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
                  <p className="font-heading text-6xl font-semibold leading-none text-primary/15 transition-colors duration-300 hover:text-primary/30">
                    {step.no}
                  </p>
                  <span className="mt-5 block h-px w-12 bg-lime" />
                  <h3 className="mt-4 font-heading text-xl font-semibold leading-snug text-ink">{step.title}</h3>
                  <p className="mt-3 text-[15px] leading-[1.8] text-muted">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= GALLERY ================= */}
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

      {/* ================= TESTIMONIALS ================= */}
      <Suspense fallback={<section className="bg-primary py-24" aria-hidden="true" />}>
        <TestimonialsSection items={site.testimonials} />
      </Suspense>

      {/* ================= BOOK APPOINTMENT ================= */}
      <section className="py-16 sm:py-24">
        <div className="container-x">
          <div className="mx-auto max-w-[1200px] rounded-[20px] bg-[#FAF8F5] px-6 py-16 shadow-[0_40px_80px_-40px_rgba(20,35,27,0.18)] sm:px-10 lg:px-20 lg:py-[100px]">
            <div className="grid items-center gap-12 md:grid-cols-[55fr_45fr] md:gap-14 lg:grid-cols-2">
              <Reveal>
                <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-ink">
                  📍 Location &amp; Contact
                </span>
                <h2 className="mt-6 font-display text-[40px] font-bold leading-[1.1] text-[#111111] sm:text-[48px] lg:text-[56px]">
                  How to Book Appointment
                </h2>

                <div className="mt-10 space-y-12">
                  <div>
                    <h3 className="font-display text-[28px] font-bold text-[#111111]">Clinic Location</h3>
                    <div className="mt-4 space-y-4 text-lg leading-relaxed text-[#555555]">
                      <p className="whitespace-pre-line">
                        {`1. ${site.general?.address || "@Kshema Healthcare,\n#338, Bogadi Main Road,\nBogadi,\nMysuru,\nKarnataka – 570026"}`}
                      </p>
                      <p className="whitespace-pre-line">
                        {`2. #1286,\n15A Cross,\nRoopanagar,\nMysuru`}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-display text-[28px] font-bold text-[#111111]">Timings</h3>
                    <p className="mt-4 text-lg leading-relaxed text-[#555555]">10:30 AM – 5:00 PM</p>
                  </div>

                  <div>
                    <h3 className="font-display text-[28px] font-bold text-[#111111]">Contact</h3>
                    <div className="mt-4 space-y-1 text-lg leading-relaxed text-[#555555]">
                      <p>
                        Phone:{" "}
                        <a
                          href={`tel:${(site.general?.phone || "+91 934-267-4406").replace(/[^+\d]/g, "")}`}
                          className="font-semibold text-primary underline-offset-4 transition hover:underline"
                        >
                          {site.general?.phone || "+91 934-267-4406"}
                        </a>
                      </p>
                      <p>
                        Email:{" "}
                        <a
                          href={`mailto:${site.general?.email || "nutrigolz@gmail.com"}`}
                          className="font-semibold text-primary underline-offset-4 transition hover:underline"
                        >
                          {site.general?.email || "nutrigolz@gmail.com"}
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.12}>
                <div className="overflow-hidden rounded-[20px] shadow-soft transition-transform duration-300 ease-out hover:scale-[1.02]">
                  <iframe
                    src={site.general?.mapEmbed || "https://maps.google.com/maps?q=Bogadi%20Main%20Road%20Mysuru%20Karnataka%20570026&t=&z=14&ie=UTF8&iwloc=&output=embed"}
                    title="GOLZ clinic location map"
                    className="h-[350px] w-full border-0 md:h-[650px]"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </Reveal>
            </div>
          </div>
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
