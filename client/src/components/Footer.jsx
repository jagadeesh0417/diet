import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Leaf, Phone, Mail, MapPin, Clock, Facebook, Instagram, Youtube, Twitter, Linkedin,
  Send, ChevronRight, MessageCircle,
} from "lucide-react";
import { useSite } from "../context/SiteContext";
import { ButtonSpinner } from "./PageLoader";

const SOCIAL_ICONS = { facebook: Facebook, instagram: Instagram, youtube: Youtube, twitter: Twitter, linkedin: Linkedin };

export default function Footer() {
  const { site } = useSite();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const g = site.general || {};
  const year = new Date().getFullYear();

  const subscribe = async (e) => {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch("/api/public/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setStatus({ ok: res.ok, text: data.message || "Done!" });
      if (res.ok) setEmail("");
    } catch {
      setStatus({ ok: false, text: "Something went wrong. Try again." });
    } finally {
      setBusy(false);
    }
  };

  const socials = Object.entries(g.socials || {})
    .filter(([, url]) => url)
    .map(([key, url]) => ({ key, url, Icon: SOCIAL_ICONS[key] }))
    .filter((s) => s.Icon);

  return (
    <footer className="bg-primary text-[#DBE6D5]/85">
      <div className="container-x grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="mb-5 flex items-center gap-2.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-white/10 text-lime">
              <Leaf size={22} />
            </span>
            <span className="font-heading text-lg font-semibold text-[#EEF3EA]">{g.clinicName || "GOLZ (Giggles of Livez)"}</span>
          </div>
          <p className="mb-6 text-sm leading-relaxed">
            Personalized, evidence-based nutrition care — helping you transform your health through science-backed
            meal plans, compassionate support and results that last.
          </p>
          <div className="flex gap-2.5">
            {socials.map(({ key, url, Icon }) => (
              <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={key}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-[#DBE6D5] transition hover:bg-lime hover:text-ink">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-5 font-heading text-base font-semibold text-[#EEF3EA]">Quick Links</h3>
          <ul className="space-y-2.5 text-sm">
            {[
              ["Home", "/"], ["About Us", "/about"], ["Services", "/services"],
              ["Gallery", "/gallery"], ["Blog", "/blog"], ["Contact", "/contact"],
            ].map(([label, to]) => (
              <li key={to}>
                <Link to={to} className="inline-flex items-center gap-1.5 transition hover:text-lime">
                  <ChevronRight size={14} className="text-lime" /> {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-5 font-heading text-base font-semibold text-[#EEF3EA]">Contact & Hours</h3>
          <ul className="space-y-4 text-sm">
            <li className="flex gap-3"><MapPin size={18} className="mt-0.5 shrink-0 text-lime" /><span>{g.address || "@Kshema Healthcare, #338, Bogadi Main Road, Bogadi, Mysuru 570026"}</span></li>
            <li className="flex gap-3"><Phone size={18} className="shrink-0 text-lime" /><a href={`tel:${g.phone}`} className="transition hover:text-lime">{g.phone}</a></li>
            <li className="flex gap-3"><Mail size={18} className="shrink-0 text-lime" /><a href={`mailto:${g.email}`} className="transition hover:text-lime">{g.email}</a></li>
            <li className="flex gap-3"><MessageCircle size={18} className="shrink-0 text-lime" /><a href={`https://wa.me/${g.whatsapp}`} target="_blank" rel="noopener noreferrer" className="transition hover:text-lime">WhatsApp Us</a></li>
          </ul>
          <div className="mt-5 rounded-[18px] border border-white/15 bg-white/5 p-4 text-sm">
            <p className="mb-2 flex items-center gap-2 font-heading font-semibold text-[#EEF3EA]"><Clock size={15} className="text-lime" /> Working Hours</p>
            {(g.workingHours || []).map((w) => (
              <p key={w.day} className="flex justify-between py-0.5 text-xs text-[#A9C0A0]/90">
                <span>{w.day}</span><span className={w.hours === "Closed" ? "text-lime" : ""}>{w.hours}</span>
              </p>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-5 font-heading text-base font-semibold text-[#EEF3EA]">Newsletter</h3>
          <p className="mb-4 text-sm text-[#A9C0A0]">Get nutrition tips, recipes and healthy-living advice in your inbox.</p>
          <form onSubmit={subscribe} className="rounded-[18px] bg-[#1E3228] p-5">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              aria-label="Email address"
              className="mb-3 w-full rounded-[11px] border border-white/15 bg-[#16281F] px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-lime"
            />
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-full bg-lime px-5 py-3 text-sm font-semibold text-ink transition hover:bg-limeDark">
              {busy ? <ButtonSpinner /> : <Send size={16} />} Subscribe
            </button>
          </form>
          {status && <p className={`mt-2 text-xs ${status.ok ? "text-lime" : "text-honey"}`}>{status.text}</p>}
          <p className="mt-4 text-xs text-[#A9C0A0]/80">By subscribing you agree to our privacy policy.</p>
          {g.mapEmbed && (
            <iframe
              src={g.mapEmbed}
              title="Clinic location map"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="mt-5 h-32 w-full rounded-[18px] border-0 opacity-90 grayscale-[30%]"
            />
          )}
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="container-x flex flex-col items-center justify-between gap-3 py-5 text-xs text-[#A9C0A0]/80 sm:flex-row">
          <p>© {year} {g.clinicName || "GOLZ (Giggles of Livez)"}. All rights reserved.</p>
          <div className="flex gap-5">
            <Link to="/privacy-policy" className="transition hover:text-lime">Privacy Policy</Link>
            <Link to="/terms" className="transition hover:text-lime">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
