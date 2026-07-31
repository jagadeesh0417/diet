import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Phone, Mail, MessageCircle, Clock, ChevronDown, CheckCircle2, Send, CalendarCheck,
} from "lucide-react";
import api from "../api/client";
import SEO from "../components/SEO";
import PageHero from "../components/PageHero";
import { useSite } from "../context/SiteContext";
import { ButtonSpinner } from "../components/PageLoader";

const FAQS = [
  { q: "How do online consultations work?", a: "After booking, you receive a link to a video call at your chosen slot. You'll get a questionnaire and diet diary link beforehand, and your plan is delivered within 48 hours of the session." },
  { q: "Do you provide diet plans for medical conditions?", a: "Yes. We specialise in medical nutrition therapy for diabetes, PCOS, thyroid, hypertension, cholesterol, fatty liver and more — always coordinated with your treating doctor." },
  { q: "How much does a consultation cost?", a: "Prices vary by program and start from our standard consultation fee. Your exact package is confirmed during booking — there are no hidden charges." },
  { q: "Can I get support between sessions?", a: "Absolutely. Every program includes WhatsApp support and scheduled follow-up calls to keep you on track." },
  { q: "Do you offer offline consultations?", a: "Yes, we're based in Mysuru — at Kshema Healthcare, Bogadi and at our Roopanagar clinic. Offline consultations are available by appointment between 10:30 AM and 5:00 PM." },
];

function FaqItem({ q, a, open, onToggle }) {
  return (
    <div className="card overflow-hidden">
      <button onClick={onToggle} className="flex w-full items-center justify-between gap-4 p-5 text-left" aria-expanded={open}>
        <span className="font-heading text-sm font-semibold text-charcoal sm:text-base">{q}</span>
        <ChevronDown size={18} className={`shrink-0 text-primary transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
            <p className="px-5 pb-5 text-sm leading-relaxed text-charcoal/65">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Contact() {
  const { site } = useSite();
  const g = site.general || {};
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get("service") ? "booking" : "message");
  const [openFaq, setOpenFaq] = useState(0);
  const [sent, setSent] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: { service: params.get("service") || "" },
  });

  useEffect(() => {
    if (params.get("service")) reset({ service: params.get("service") });
  }, [params, reset]);

  const onSubmit = async (values) => {
    setBusy(true);
    setError(null);
    try {
      const endpoint = mode === "booking" ? "/public/appointments" : "/public/contact";
      const { data } = await api.post(endpoint, values);
      setSent(data.message);
      reset({ service: "" });
    } catch (e) {
      setError(e.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <SEO
        title="Contact"
        description="Book a consultation or get in touch — phone, WhatsApp, email or visit the clinic in Mysuru."
        keywords="contact nutritionist, book consultation, dietitian appointment"
      />
      <PageHero title="Contact Us" subtitle="Have a question or ready to begin? We'd love to hear from you." breadcrumb={["Contact"]} />

      <section className="py-20">
        <div className="container-x">
          {/* Info cards */}
          <div className="mb-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { Icon: MapPin, title: "Clinic Address", lines: [g.address || "@Kshema Healthcare, #338, Bogadi Main Road, Bogadi, Mysuru 570026"] },
              { Icon: Phone, title: "Call Us", lines: [g.phone || "+91 98765 43210"] },
              { Icon: Mail, title: "Email Us", lines: [g.email || "hello@nutrixwellness.in"] },
              { Icon: MessageCircle, title: "WhatsApp", lines: ["Chat with us instantly"] },
            ].map(({ Icon, title, lines }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="card p-6 text-center">
                <span className="mx-auto mb-4 flex h-13 w-13 items-center justify-center rounded-2xl bg-primary/10 p-3.5 text-primary"><Icon size={24} /></span>
                <h3 className="mb-1.5 font-heading font-semibold text-charcoal">{title}</h3>
                {lines.map((l) => <p key={l} className="text-sm text-charcoal/60">{l}</p>)}
              </motion.div>
            ))}
          </div>

          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
            {/* Form */}
            <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <h2 className="mb-2 font-heading text-2xl font-bold text-charcoal">
                {mode === "booking" ? "Book a Consultation" : "Send Us a Message"}
              </h2>
              <p className="mb-7 text-sm text-charcoal/55">
                {mode === "booking"
                  ? "Pick a program and your preferred slot — we'll confirm your consultation shortly."
                  : "We usually reply within 24 hours on working days."}
              </p>

              <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-gray-100 p-1.5" role="tablist" aria-label="Form mode">
                <button
                  type="button"
                  onClick={() => setMode("message")}
                  role="tab"
                  aria-selected={mode === "message"}
                  className={`rounded-xl py-2.5 font-heading text-sm font-semibold transition ${mode === "message" ? "bg-white text-primary shadow-card" : "text-charcoal/55 hover:text-charcoal"}`}
                >
                  Send Message
                </button>
                <button
                  type="button"
                  onClick={() => setMode("booking")}
                  role="tab"
                  aria-selected={mode === "booking"}
                  className={`rounded-xl py-2.5 font-heading text-sm font-semibold transition ${mode === "booking" ? "bg-white text-primary shadow-card" : "text-charcoal/55 hover:text-charcoal"}`}
                >
                  Book Consultation
                </button>
              </div>

              {sent ? (
                <div className="card flex flex-col items-center gap-4 p-12 text-center">
                  <CheckCircle2 size={56} className="text-primary" />
                  <h3 className="font-heading text-xl font-bold text-charcoal">Message Sent!</h3>
                  <p className="text-sm text-charcoal/60">{sent}</p>
                  <button onClick={() => setSent(null)} className="btn-outline mt-2">Send Another</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="card grid gap-5 p-8" noValidate>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="cf-name" className="label">Name *</label>
                      <input id="cf-name" className="input" placeholder="Your full name" {...register("name", { required: "Name is required" })} />
                      {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                    </div>
                    <div>
                      <label htmlFor="cf-phone" className="label">Phone *</label>
                      <input id="cf-phone" className="input" placeholder="+91 98xxxxxx" {...register("phone", { required: "Phone is required", pattern: { value: /^[+\d][\d\s-]{7,15}$/, message: "Enter a valid phone number" } })} />
                      {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="cf-email" className="label">Email *</label>
                    <input id="cf-email" type="email" className="input" placeholder="you@example.com" {...register("email", { required: "Email is required", pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" } })} />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="cf-subject" className="label">{mode === "booking" ? "Program *" : "Subject"}</label>
                    {mode === "booking" ? (
                      <select
                        id="cf-subject"
                        className="input"
                        {...register("service", { required: "Please select a program" })}
                      >
                        <option value="">Select a program…</option>
                        {site.services.map((s) => (
                          <option key={s._id} value={s.title}>{s.title}</option>
                        ))}
                        <option value="Other / Not sure">Other / Not sure yet</option>
                      </select>
                    ) : (
                      <input id="cf-subject" className="input" placeholder="What's this about?" {...register("subject")} />
                    )}
                    {errors.service && <p className="mt-1 text-xs text-red-500">{errors.service.message}</p>}
                  </div>

                  {mode === "booking" && (
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="cf-date" className="label">Preferred Date *</label>
                        <input id="cf-date" type="date" className="input" min={new Date().toISOString().slice(0, 10)} {...register("preferredDate", { required: "Pick a date" })} />
                        {errors.preferredDate && <p className="mt-1 text-xs text-red-500">{errors.preferredDate.message}</p>}
                      </div>
                      <div>
                        <label htmlFor="cf-time" className="label">Preferred Time *</label>
                        <select id="cf-time" className="input" {...register("preferredTime", { required: "Pick a slot" })}>
                          <option value="">Select a slot…</option>
                          <option>Morning (9 AM – 12 PM)</option>
                          <option>Afternoon (12 PM – 4 PM)</option>
                          <option>Evening (4 PM – 7 PM)</option>
                        </select>
                        {errors.preferredTime && <p className="mt-1 text-xs text-red-500">{errors.preferredTime.message}</p>}
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="cf-message" className="label">Message {mode === "booking" ? "(optional)" : "*"}</label>
                    <textarea
                      id="cf-message"
                      rows={mode === "booking" ? 3 : 4}
                      className="input resize-none"
                      placeholder={mode === "booking" ? "Any health concerns or goals to share…" : "Tell us about your goals…"}
                      {...register("message", mode === "booking" ? {} : { required: "Message is required", minLength: { value: 10, message: "Please write at least 10 characters" } })}
                    />
                    {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
                  </div>
                  {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
                  <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-60">
                    {busy ? <ButtonSpinner /> : <>{mode === "booking" ? <><CalendarCheck size={17} /> Request Consultation</> : <><Send size={17} /> Send Message</>}</>}
                  </button>
                </form>
              )}
            </motion.div>

            {/* Info column */}
            <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <div className="card mb-8 overflow-hidden p-0">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                  <h3 className="font-heading font-semibold text-charcoal">Working Hours</h3>
                  <Clock size={18} className="text-primary" />
                </div>
                <div className="divide-y divide-gray-50 px-6">
                  {(g.workingHours || []).map((w) => (
                    <p key={w.day} className="flex justify-between py-3.5 text-sm">
                      <span className="text-charcoal/70">{w.day}</span>
                      <span className={`font-semibold ${w.hours === "Closed" ? "text-accent" : "text-primary"}`}>{w.hours}</span>
                    </p>
                  ))}
                </div>
              </div>

              {g.mapEmbed && (
                <div className="mb-8 overflow-hidden rounded-3xl shadow-card">
                  <iframe src={g.mapEmbed} title="Clinic location" loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-72 w-full border-0" />
                </div>
              )}

              <h3 className="mb-4 font-heading text-xl font-bold text-charcoal">Frequently Asked Questions</h3>
              <div className="space-y-3">
                {FAQS.map((f, i) => (
                  <FaqItem key={f.q} q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? -1 : i)} />
                ))}
              </div>

              <div className="mt-8 rounded-3xl bg-gradient-to-br from-primary to-primary-dark p-7 text-white shadow-lift">
                <h3 className="mb-2 font-heading text-lg font-bold">Prefer WhatsApp?</h3>
                <p className="mb-4 text-sm text-white/80">Message us anytime — we'll get back to you within working hours.</p>
                <a href={`https://wa.me/${g.whatsapp}`} target="_blank" rel="noopener noreferrer" className="btn-gold !bg-white !text-primary">
                  <MessageCircle size={17} /> Chat on WhatsApp
                </a>
              </div>
            </motion.div>
          </div>

          <p className="mt-10 text-center text-sm text-charcoal/50">
            Prefer to book a full consultation?{" "}
            <Link to="/services" className="font-semibold text-primary underline underline-offset-2">Browse our programs</Link>
          </p>
        </div>
      </section>
    </>
  );
}
