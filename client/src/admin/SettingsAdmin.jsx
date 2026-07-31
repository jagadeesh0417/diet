import { useEffect, useState, useCallback } from "react";
import { Save, Settings, Layout, UserRound, Search, ShieldCheck, Trash2, Plus } from "lucide-react";
import api from "../api/client";
import SEO from "../components/SEO";
import PageLoader from "../components/PageLoader";
import { Field, Toast, ListEditor, UploadInput, ConfirmDialog, EmptyState } from "./AdminUI";
import { useSite } from "../context/SiteContext";
import { useAuth } from "../context/AuthContext";

const TABS = [
  { key: "general", label: "General", Icon: Settings },
  { key: "homepage", label: "Homepage", Icon: Layout },
  { key: "about", label: "About Page", Icon: UserRound },
  { key: "seo", label: "SEO", Icon: Search },
  { key: "security", label: "Security & Users", Icon: ShieldCheck },
];

const DEFAULT_SECTIONS = { general: {}, homepage: {}, about: {}, seo: {} };

export default function SettingsAdmin() {
  const [tab, setTab] = useState("general");
  const [sections, setSections] = useState(DEFAULT_SECTIONS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const { refresh } = useSite();

  const load = useCallback(async () => {
    setLoading(true);
    const [general, homepage, about, seo] = await Promise.all([
      api.get("/admin/settings/general"),
      api.get("/admin/settings/homepage"),
      api.get("/admin/settings/about"),
      api.get("/admin/settings/seo"),
    ]);
    setSections({
      general: general.data.value,
      homepage: homepage.data.value,
      about: about.data.value,
      seo: seo.data.value,
    });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (section) => (value) => setSections((s) => ({ ...s, [section]: value }));
  const setField = (section, key) => (e) => {
    const v = e.target.value;
    setSections((s) => ({ ...s, [section]: { ...s[section], [key]: v } }));
  };

  const save = async () => {
    setSaving(true);
    try {
      for (const key of ["general", "homepage", "about", "seo"]) {
        await api.put(`/admin/settings/${key}`, { value: sections[key] });
      }
      showToast("All settings saved — the website updates instantly");
      refresh();
    } catch (e) {
      showToast(e.response?.data?.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const showToast = (message, type = "success") => { setToast({ message, type }); setTimeout(() => setToast(null), 3500); };

  if (loading) return <PageLoader />;

  const g = sections.general;
  const h = sections.homepage;
  const a = sections.about;
  const seo = sections.seo;

  return (
    <>
      <SEO title="Settings & SEO" />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {TABS.map(({ key, label, Icon }) => (
            <button key={key} onClick={() => setTab(key)} className={`chip ${tab === key ? "chip-active" : ""}`}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>
        {tab !== "security" && (
          <button onClick={save} disabled={saving} className="btn-primary !px-5 !py-2.5 !text-sm disabled:opacity-60">
            <Save size={16} /> {saving ? "Saving…" : "Save All Changes"}
          </button>
        )}
      </div>

      {/* ---------- GENERAL ---------- */}
      {tab === "general" && (
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="card space-y-5 p-6">
            <h3 className="font-heading font-semibold text-charcoal">Brand</h3>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Clinic name"><input className="input" value={g.clinicName || ""} onChange={setField("general", "clinicName")} /></Field>
              <Field label="Tagline"><input className="input" value={g.tagline || ""} onChange={setField("general", "tagline")} /></Field>
            </div>
            <Field label="Address"><input className="input" value={g.address || ""} onChange={setField("general", "address")} /></Field>
            <Field label="Google Maps embed URL" hint='Embed code — e.g. https://maps.google.com/maps?q=…&output=embed'>
              <input className="input" value={g.mapEmbed || ""} onChange={setField("general", "mapEmbed")} />
            </Field>
          </div>
          <div className="space-y-6">
            <div className="card space-y-5 p-6">
              <h3 className="font-heading font-semibold text-charcoal">Contact</h3>
              <div className="grid gap-5 sm:grid-cols-3">
                <Field label="Phone"><input className="input" value={g.phone || ""} onChange={setField("general", "phone")} /></Field>
                <Field label="WhatsApp number" hint="Digits with country code"><input className="input" value={g.whatsapp || ""} onChange={setField("general", "whatsapp")} /></Field>
                <Field label="Email"><input className="input" value={g.email || ""} onChange={setField("general", "email")} /></Field>
              </div>
              <Field label="Currency symbol"><input className="input" value={g.currency || "₹"} onChange={setField("general", "currency")} /></Field>
              <Field label="Social media links">
                <div className="grid gap-3 sm:grid-cols-2">
                  {["facebook", "instagram", "youtube", "twitter", "linkedin"].map((k) => (
                    <input key={k} className="input" placeholder={`https://${k}.com/…`} value={g.socials?.[k] || ""}
                      onChange={(e) => set("general")({ ...g, socials: { ...(g.socials || {}), [k]: e.target.value } })} />
                  ))}
                </div>
              </Field>
            </div>
            <div className="card p-6">
              <h3 className="mb-4 font-heading font-semibold text-charcoal">Working Hours</h3>
              {(g.workingHours || []).map((w, i) => (
                <div key={i} className="mb-3 flex gap-3">
                  <input className="input" placeholder="Day(s)" value={w.day}
                    onChange={(e) => {
                      const wh = [...(g.workingHours || [])];
                      wh[i] = { ...wh[i], day: e.target.value };
                      set("general")({ ...g, workingHours: wh });
                    }} />
                  <input className="input" placeholder="Hours" value={w.hours}
                    onChange={(e) => {
                      const wh = [...(g.workingHours || [])];
                      wh[i] = { ...wh[i], hours: e.target.value };
                      set("general")({ ...g, workingHours: wh });
                    }} />
                  <button onClick={() => set("general")({ ...g, workingHours: g.workingHours.filter((_, j) => j !== i) })} className="shrink-0 rounded-lg bg-red-50 px-3 text-red-500 hover:bg-red-500 hover:text-white" aria-label="Remove row">×</button>
                </div>
              ))}
              <button onClick={() => set("general")({ ...g, workingHours: [...(g.workingHours || []), { day: "", hours: "" }] })} className="btn-outline !px-4 !py-2 !text-xs">
                <Plus size={14} /> Add Row
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- HOMEPAGE ---------- */}
      {tab === "homepage" && (
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="card space-y-5 p-6">
            <h3 className="font-heading font-semibold text-charcoal">Hero Section</h3>
            <Field label="Hero badge"><input className="input" value={h.heroBadge || ""} onChange={setField("homepage", "heroBadge")} /></Field>
            <Field label="Hero title"><textarea rows={2} className="input resize-none" value={h.heroTitle || ""} onChange={setField("homepage", "heroTitle")} /></Field>
            <Field label="Hero subtitle"><textarea rows={2} className="input resize-none" value={h.heroSubtitle || ""} onChange={setField("homepage", "heroSubtitle")} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Primary button label"><input className="input" value={h.ctaPrimary?.label || ""} onChange={(e) => set("homepage")({ ...h, ctaPrimary: { ...(h.ctaPrimary || {}), label: e.target.value } })} /></Field>
              <Field label="Primary button link"><input className="input" value={h.ctaPrimary?.link || ""} onChange={(e) => set("homepage")({ ...h, ctaPrimary: { ...(h.ctaPrimary || {}), link: e.target.value } })} /></Field>
              <Field label="Secondary button label"><input className="input" value={h.ctaSecondary?.label || ""} onChange={(e) => set("homepage")({ ...h, ctaSecondary: { ...(h.ctaSecondary || {}), label: e.target.value } })} /></Field>
              <Field label="Secondary button link"><input className="input" value={h.ctaSecondary?.link || ""} onChange={(e) => set("homepage")({ ...h, ctaSecondary: { ...(h.ctaSecondary || {}), link: e.target.value } })} /></Field>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Hero background image"><UploadInput value={h.heroImage} onChange={(url) => set("homepage")({ ...h, heroImage: url })} /></Field>
              <Field label="Hero nutritionist photo"><UploadInput value={h.heroPortrait} onChange={(url) => set("homepage")({ ...h, heroPortrait: url })} /></Field>
            </div>
            <Field label="Hero statistics" hint="Shown under the hero heading">
              <div className="space-y-2">
                {(h.stats || []).map((s, i) => (
                  <div key={i} className="flex gap-2">
                    <input className="input !w-24" placeholder="Value" value={s.value}
                      onChange={(e) => { const st = [...(h.stats || [])]; st[i] = { ...st[i], value: e.target.value }; set("homepage")({ ...h, stats: st }); }} />
                    <input className="input !w-20" placeholder="Suffix" value={s.suffix}
                      onChange={(e) => { const st = [...(h.stats || [])]; st[i] = { ...st[i], suffix: e.target.value }; set("homepage")({ ...h, stats: st }); }} />
                    <input className="input flex-1" placeholder="Label" value={s.label}
                      onChange={(e) => { const st = [...(h.stats || [])]; st[i] = { ...st[i], label: e.target.value }; set("homepage")({ ...h, stats: st }); }} />
                    <button onClick={() => set("homepage")({ ...h, stats: h.stats.filter((_, j) => j !== i) })} className="shrink-0 rounded-lg bg-red-50 px-3 text-red-500" aria-label="Remove">×</button>
                  </div>
                ))}
                <button onClick={() => set("homepage")({ ...h, stats: [...(h.stats || []), { value: 0, suffix: "+", label: "" }] })} className="btn-outline !px-4 !py-2 !text-xs">
                  <Plus size={14} /> Add Stat
                </button>
              </div>
            </Field>
          </div>

          <div className="space-y-6">
            <div className="card space-y-5 p-6">
              <h3 className="font-heading font-semibold text-charcoal">Trust Section</h3>
              {(h.trustItems || []).map((t, i) => (
                <div key={i} className="flex gap-2">
                  <input className="input flex-1" placeholder="Title" value={t.title}
                    onChange={(e) => { const items = [...(h.trustItems || [])]; items[i] = { ...items[i], title: e.target.value }; set("homepage")({ ...h, trustItems: items }); }} />
                  <input className="input flex-1" placeholder="Short text" value={t.text}
                    onChange={(e) => { const items = [...(h.trustItems || [])]; items[i] = { ...items[i], text: e.target.value }; set("homepage")({ ...h, trustItems: items }); }} />
                  <button onClick={() => set("homepage")({ ...h, trustItems: h.trustItems.filter((_, j) => j !== i) })} className="shrink-0 rounded-lg bg-red-50 px-3 text-red-500" aria-label="Remove">×</button>
                </div>
              ))}
              <button onClick={() => set("homepage")({ ...h, trustItems: [...(h.trustItems || []), { title: "", text: "" }] })} className="btn-outline !px-4 !py-2 !text-xs">
                <Plus size={14} /> Add Trust Item
              </button>
            </div>

            <div className="card space-y-5 p-6">
              <h3 className="font-heading font-semibold text-charcoal">About Preview</h3>
              <Field label="Title"><input className="input" value={h.aboutPreview?.title || ""} onChange={(e) => set("homepage")({ ...h, aboutPreview: { ...(h.aboutPreview || {}), title: e.target.value } })} /></Field>
              <Field label="Text"><textarea rows={4} className="input resize-none" value={h.aboutPreview?.text || ""} onChange={(e) => set("homepage")({ ...h, aboutPreview: { ...(h.aboutPreview || {}), text: e.target.value } })} /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Button label"><input className="input" value={h.aboutPreview?.buttonLabel || ""} onChange={(e) => set("homepage")({ ...h, aboutPreview: { ...(h.aboutPreview || {}), buttonLabel: e.target.value } })} /></Field>
                <Field label="Button link"><input className="input" value={h.aboutPreview?.buttonLink || ""} onChange={(e) => set("homepage")({ ...h, aboutPreview: { ...(h.aboutPreview || {}), buttonLink: e.target.value } })} /></Field>
              </div>
              <Field label="Image"><UploadInput value={h.aboutPreview?.image} onChange={(url) => set("homepage")({ ...h, aboutPreview: { ...(h.aboutPreview || {}), image: url } })} /></Field>
            </div>

            <div className="card space-y-5 p-6">
              <h3 className="font-heading font-semibold text-charcoal">Why Choose Us</h3>
              {(h.whyChooseUs || []).map((w, i) => (
                <div key={i} className="rounded-2xl bg-gray-50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-heading text-sm font-semibold text-charcoal">#{i + 1}</p>
                    <button onClick={() => set("homepage")({ ...h, whyChooseUs: h.whyChooseUs.filter((_, j) => j !== i) })} className="rounded-lg bg-red-50 px-2.5 py-1 text-xs text-red-500" aria-label="Remove">Remove</button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <input className="input" placeholder="Title" value={w.title} onChange={(e) => { const items = [...h.whyChooseUs]; items[i] = { ...items[i], title: e.target.value }; set("homepage")({ ...h, whyChooseUs: items }); }} />
                    <input className="input sm:col-span-2" placeholder="Text" value={w.text} onChange={(e) => { const items = [...h.whyChooseUs]; items[i] = { ...items[i], text: e.target.value }; set("homepage")({ ...h, whyChooseUs: items }); }} />
                  </div>
                </div>
              ))}
              <button onClick={() => set("homepage")({ ...h, whyChooseUs: [...(h.whyChooseUs || []), { title: "", text: "" }] })} className="btn-outline !px-4 !py-2 !text-xs">
                <Plus size={14} /> Add Item
              </button>
            </div>

            <div className="card space-y-5 p-6">
              <h3 className="font-heading font-semibold text-charcoal">Call-To-Action Section</h3>
              <Field label="Title"><input className="input" value={h.cta?.title || ""} onChange={(e) => set("homepage")({ ...h, cta: { ...(h.cta || {}), title: e.target.value } })} /></Field>
              <Field label="Subtitle"><input className="input" value={h.cta?.subtitle || ""} onChange={(e) => set("homepage")({ ...h, cta: { ...(h.cta || {}), subtitle: e.target.value } })} /></Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Button label"><input className="input" value={h.cta?.buttonLabel || ""} onChange={(e) => set("homepage")({ ...h, cta: { ...(h.cta || {}), buttonLabel: e.target.value } })} /></Field>
                <Field label="Button link"><input className="input" value={h.cta?.buttonLink || ""} onChange={(e) => set("homepage")({ ...h, cta: { ...(h.cta || {}), buttonLink: e.target.value } })} /></Field>
              </div>
              <Field label="Background image"><UploadInput value={h.cta?.image} onChange={(url) => set("homepage")({ ...h, cta: { ...(h.cta || {}), image: url } })} /></Field>
            </div>
          </div>
        </div>
      )}

      {/* ---------- ABOUT ---------- */}
      {tab === "about" && (
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="space-y-6">
            <div className="card space-y-5 p-6">
              <h3 className="font-heading font-semibold text-charcoal">Profile</h3>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Name"><input className="input" value={a.name || ""} onChange={setField("about", "name")} /></Field>
                <Field label="Designation"><input className="input" value={a.designation || ""} onChange={setField("about", "designation")} /></Field>
              </div>
              <Field label="Hero banner title"><input className="input" value={a.heroTitle || ""} onChange={setField("about", "heroTitle")} /></Field>
              <Field label="Biography"><textarea rows={5} className="input resize-none" value={a.bio || ""} onChange={setField("about", "bio")} /></Field>
              <Field label="Story (intro)"><textarea rows={4} className="input resize-none" value={a.story || ""} onChange={setField("about", "story")} /></Field>
              <Field label="Her approach"><textarea rows={4} className="input resize-none" value={a.approach || ""} onChange={setField("about", "approach")} /></Field>
              <Field label="Beyond the clinic"><textarea rows={4} className="input resize-none" value={a.beyondClinic || ""} onChange={setField("about", "beyondClinic")} /></Field>
              <Field label="Affiliations (separate with ·)"><input className="input" value={a.affiliations || ""} onChange={setField("about", "affiliations")} /></Field>
              <Field label="Profile image"><UploadInput value={a.image} onChange={(url) => set("about")({ ...a, image: url })} /></Field>
            </div>
            <div className="card space-y-5 p-6">
              <h3 className="font-heading font-semibold text-charcoal">Mission & Vision</h3>
              <Field label="Mission"><textarea rows={3} className="input resize-none" value={a.mission || ""} onChange={setField("about", "mission")} /></Field>
              <Field label="Vision"><textarea rows={3} className="input resize-none" value={a.vision || ""} onChange={setField("about", "vision")} /></Field>
            </div>
            <div className="card space-y-5 p-6">
              <h3 className="font-heading font-semibold text-charcoal">Statistics</h3>
              {(a.stats || []).map((s, i) => (
                <div key={i} className="flex gap-2">
                  <input className="input !w-24" value={s.value} onChange={(e) => { const st = [...(a.stats || [])]; st[i] = { ...st[i], value: e.target.value }; set("about")({ ...a, stats: st }); }} />
                  <input className="input !w-20" value={s.suffix} onChange={(e) => { const st = [...(a.stats || [])]; st[i] = { ...st[i], suffix: e.target.value }; set("about")({ ...a, stats: st }); }} />
                  <input className="input flex-1" value={s.label} onChange={(e) => { const st = [...(a.stats || [])]; st[i] = { ...st[i], label: e.target.value }; set("about")({ ...a, stats: st }); }} />
                  <button onClick={() => set("about")({ ...a, stats: a.stats.filter((_, j) => j !== i) })} className="shrink-0 rounded-lg bg-red-50 px-3 text-red-500" aria-label="Remove">×</button>
                </div>
              ))}
              <button onClick={() => set("about")({ ...a, stats: [...(a.stats || []), { value: 0, suffix: "+", label: "" }] })} className="btn-outline !px-4 !py-2 !text-xs"><Plus size={14} /> Add Stat</button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card space-y-5 p-6">
              <h3 className="font-heading font-semibold text-charcoal">Qualifications</h3>
              <ListEditor items={a.qualifications || []} onChange={(qualifications) => set("about")({ ...a, qualifications })} />
            </div>
            <div className="card space-y-5 p-6">
              <h3 className="font-heading font-semibold text-charcoal">Certifications</h3>
              <ListEditor items={a.certifications || []} onChange={(certifications) => set("about")({ ...a, certifications })} />
            </div>
            <div className="card space-y-5 p-6">
              <h3 className="font-heading font-semibold text-charcoal">Achievements & Awards</h3>
              <ListEditor items={a.achievements || []} onChange={(achievements) => set("about")({ ...a, achievements })} />
            </div>
            <div className="card space-y-5 p-6">
              <h3 className="font-heading font-semibold text-charcoal">Credentials (About page)</h3>
              <ListEditor items={a.credentials || []} onChange={(credentials) => set("about")({ ...a, credentials })} />
            </div>
            <div className="card space-y-5 p-6">
              <h3 className="font-heading font-semibold text-charcoal">Recognition (About page)</h3>
              <ListEditor items={a.recognition || []} onChange={(recognition) => set("about")({ ...a, recognition })} />
              <Field label="Recognition footnote">
                <input className="input" value={a.recognitionFootnote || ""} onChange={setField("about", "recognitionFootnote")} />
              </Field>
            </div>
            <div className="card space-y-5 p-6">
              <h3 className="font-heading font-semibold text-charcoal">Professional Timeline</h3>
              {(a.timeline || []).map((t, i) => (
                <div key={i} className="rounded-2xl bg-gray-50 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <input className="input !w-24" placeholder="Year" value={t.year} onChange={(e) => { const tl = [...a.timeline]; tl[i] = { ...tl[i], year: e.target.value }; set("about")({ ...a, timeline: tl }); }} />
                    <button onClick={() => set("about")({ ...a, timeline: a.timeline.filter((_, j) => j !== i) })} className="rounded-lg bg-red-50 px-2.5 py-1 text-xs text-red-500" aria-label="Remove">Remove</button>
                  </div>
                  <input className="input mb-2" placeholder="Title" value={t.title} onChange={(e) => { const tl = [...a.timeline]; tl[i] = { ...tl[i], title: e.target.value }; set("about")({ ...a, timeline: tl }); }} />
                  <input className="input" placeholder="Description" value={t.text} onChange={(e) => { const tl = [...a.timeline]; tl[i] = { ...tl[i], text: e.target.value }; set("about")({ ...a, timeline: tl }); }} />
                </div>
              ))}
              <button onClick={() => set("about")({ ...a, timeline: [...(a.timeline || []), { year: "", title: "", text: "" }] })} className="btn-outline !px-4 !py-2 !text-xs"><Plus size={14} /> Add Timeline Entry</button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- SEO ---------- */}
      {tab === "seo" && (
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="card space-y-5 p-6">
            <h3 className="font-heading font-semibold text-charcoal">Meta & Social Preview</h3>
            <Field label="Meta title" hint={`${(seo.metaTitle || "").length}/60 characters`}>
              <input className="input" value={seo.metaTitle || ""} onChange={setField("seo", "metaTitle")} />
            </Field>
            <Field label="Meta description" hint={`${(seo.metaDescription || "").length}/160 characters`}>
              <textarea rows={3} className="input resize-none" value={seo.metaDescription || ""} onChange={setField("seo", "metaDescription")} />
            </Field>
            <Field label="Keywords" hint="Comma separated">
              <input className="input" value={seo.keywords || ""} onChange={setField("seo", "keywords")} />
            </Field>
            <Field label="Open Graph image (social shares)">
              <UploadInput value={seo.ogImage} onChange={(url) => set("seo")({ ...seo, ogImage: url })} />
            </Field>
            <Field label="Favicon URL" hint="Upload an .ico / .png / .svg — leave empty for the default leaf icon">
              <input className="input" value={seo.favicon || ""} onChange={setField("seo", "favicon")} />
            </Field>
          </div>
          <div className="card space-y-5 p-6">
            <h3 className="font-heading font-semibold text-charcoal">Robots & Sitemap</h3>
            <p className="text-sm leading-relaxed text-charcoal/60">
              The server automatically generates:
            </p>
            <div className="space-y-2">
              <p className="rounded-xl bg-gray-50 px-4 py-3 font-mono text-xs text-charcoal/70">GET /sitemap.xml — all pages, services and published blogs</p>
              <p className="rounded-xl bg-gray-50 px-4 py-3 font-mono text-xs text-charcoal/70">GET /robots.txt — allows crawling, disallows /admin, points to the sitemap</p>
            </div>
            <Field label="Extra robots.txt rules" hint="Appended to the generated robots.txt (optional)">
              <textarea rows={3} className="input resize-none font-mono text-xs" value={seo.robotsText || ""} onChange={setField("seo", "robotsText")} placeholder="Disallow: /checkout" />
            </Field>
            <p className="rounded-2xl bg-primary/5 p-4 text-xs leading-relaxed text-charcoal/60">
              Tip: every page also injects structured data (schema.org) — MedicalClinic on the home page, Person on About,
              BlogPosting on articles and MedicalProcedure on service pages.
            </p>
          </div>
        </div>
      )}

      {/* ---------- SECURITY ---------- */}
      {tab === "security" && <SecurityTab />}

      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </>
  );
}

function SecurityTab() {
  const { user } = useAuth();
  const [users, setUsers] = useState(null);
  const [toast, setToast] = useState(null);
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [pwMsg, setPwMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "editor" });
  const [deleting, setDeleting] = useState(null);

  const loadUsers = () => api.get("/auth/users").then(({ data }) => setUsers(data));
  useEffect(() => { loadUsers(); }, []);

  const showToast = (message, type = "success") => { setToast({ message, type }); setTimeout(() => setToast(null), 3000); };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwMsg(null);
    setBusy(true);
    try {
      await api.put("/auth/password", pw);
      setPw({ currentPassword: "", newPassword: "" });
      setPwMsg({ ok: true, text: "Password updated successfully" });
    } catch (err) {
      setPwMsg({ ok: false, text: err.response?.data?.message || "Update failed" });
    } finally {
      setBusy(false);
    }
  };

  const addUser = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/auth/users", newUser);
      setNewUser({ name: "", email: "", password: "", role: "editor" });
      loadUsers();
      showToast("User created");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create user", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className="card space-y-5 p-6">
        <h3 className="font-heading font-semibold text-charcoal">Change My Password</h3>
        <form onSubmit={changePassword} className="space-y-4">
          <Field label="Current password">
            <input type="password" className="input" required value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
          </Field>
          <Field label="New password" hint="Minimum 8 characters">
            <input type="password" className="input" required value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
          </Field>
          {pwMsg && <p className={`rounded-xl px-4 py-3 text-sm ${pwMsg.ok ? "bg-primary/10 text-primary" : "bg-red-50 text-red-600"}`}>{pwMsg.text}</p>}
          <button type="submit" disabled={busy} className="btn-primary !px-5 !py-2.5 !text-sm disabled:opacity-60">Update Password</button>
        </form>
        <div className="rounded-2xl bg-gray-50 p-4 text-xs leading-relaxed text-charcoal/60">
          <p className="mb-1 font-semibold text-charcoal/80">Session security</p>
          <p>• Passwords are hashed with bcrypt (10 rounds)</p>
          <p>• Sessions use httpOnly JWT cookies (7-day expiry)</p>
          <p>• Auto logout after 30 minutes of inactivity</p>
          <p>• Login rate-limited to 10 attempts / 15 min</p>
          <p>• Every admin action is recorded in the activity log</p>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="mb-5 font-heading font-semibold text-charcoal">Team Members {user?.role !== "admin" && <span className="text-xs font-normal text-charcoal/45">(admin only)</span>}</h3>
        {user?.role === "admin" ? (
          <>
            <form onSubmit={addUser} className="mb-6 grid gap-3 rounded-2xl bg-gray-50 p-4 sm:grid-cols-2">
              <input className="input" placeholder="Name" required value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
              <input type="email" className="input" placeholder="Email" required value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
              <input type="password" className="input" placeholder="Password (min 8 chars)" required minLength={8} value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
              <select className="input" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
              <button type="submit" disabled={busy} className="btn-primary sm:col-span-2 !py-2.5 !text-sm disabled:opacity-60">
                <Plus size={16} /> Add Team Member
              </button>
            </form>
            {!users ? (
              <PageLoader />
            ) : users.length === 0 ? (
              <EmptyState text="No team members" />
            ) : (
              <ul className="space-y-3">
                {users.map((u) => (
                  <li key={u._id} className="flex items-center justify-between rounded-2xl border border-gray-100 p-4">
                    <div>
                      <p className="font-heading text-sm font-semibold text-charcoal">{u.name} {u._id === user?._id && <span className="text-xs text-primary">(you)</span>}</p>
                      <p className="text-xs text-charcoal/50">{u.email} • {u.role} • last login {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString("en-IN") : "never"}</p>
                    </div>
                    {u._id !== user?._id && (
                      <button onClick={() => setDeleting(u)} className="rounded-lg bg-red-50 p-2 text-red-500 transition hover:bg-red-500 hover:text-white" aria-label={`Remove ${u.name}`}>
                        <Trash2 size={15} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="text-sm text-charcoal/55">Only admins can manage team members.</p>
        )}
      </div>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Remove team member?"
        text={`${deleting?.name} will lose access immediately.`}
        onConfirm={async () => {
          await api.delete(`/auth/users/${deleting._id}`);
          setDeleting(null);
          loadUsers();
          showToast("User removed");
        }}
      />
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </div>
  );
}
