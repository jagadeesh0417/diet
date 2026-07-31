import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Star, Eye, EyeOff, Upload } from "lucide-react";
import api from "../api/client";
import SEO from "../components/SEO";
import PageLoader from "../components/PageLoader";
import { Modal, ConfirmDialog, Toast, Field, Toggle, EmptyState } from "./AdminUI";
import StarRating from "../components/StarRating";

const EMPTY = { name: "", role: "", photo: "", rating: 5, text: "", result: "", featured: false, published: true };

export default function TestimonialsAdmin() {
  const [items, setItems] = useState(null);
  const [editing, setEditing] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/admin/testimonials").then(({ data }) => setItems(data));
  useEffect(() => { load(); }, []);

  const showToast = (message) => { setToast({ message }); setTimeout(() => setToast(null), 3000); };

  const save = async () => {
    setSaving(true);
    try {
      if (isNew) {
        await api.post("/admin/testimonials", editing);
        showToast("Testimonial added");
      } else {
        await api.put(`/admin/testimonials/${editing._id}`, editing);
        showToast("Testimonial updated");
      }
      setEditing(null);
      load();
    } catch (e) {
      showToast(e.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (t, field) => {
    await api.put(`/admin/testimonials/${t._id}`, { [field]: !t[field] });
    load();
  };

  const uploadPhoto = async (e) => {
    const f = e.target.files?.[0];
    if (!f || !editing) return;
    const form = new FormData();
    form.append("file", f);
    const { data } = await api.post(`/admin/testimonials/${editing._id}/photo`, form);
    setEditing(data);
    load();
  };

  return (
    <>
      <SEO title="Testimonials" />
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-sm text-charcoal/55">Client success stories shown on the home page slider.</p>
        <button className="btn-primary !px-5 !py-2.5 !text-sm" onClick={() => { setEditing({ ...EMPTY }); setIsNew(true); }}>
          <Plus size={17} /> Add Testimonial
        </button>
      </div>

      {!items ? (
        <PageLoader />
      ) : items.length === 0 ? (
        <EmptyState text="No testimonials yet." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((t) => (
            <div key={t._id} className={`card p-6 ${!t.published ? "opacity-60" : ""}`}>
              <div className="mb-3 flex items-center gap-3">
                {t.photo ? (
                  <img src={t.photo} alt={t.name} className="h-12 w-12 rounded-full object-cover ring-2 ring-primary/20" />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-bold text-white">{t.name?.[0]}</span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-heading text-sm font-semibold text-charcoal">{t.name}</p>
                  <p className="truncate text-xs text-charcoal/50">{t.role}</p>
                </div>
                <StarRating rating={t.rating} size={14} />
              </div>
              <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-charcoal/70">“{t.text}”</p>
              {t.result && <p className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">🏆 {t.result}</p>}
              <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="flex gap-1.5">
                  <button onClick={() => toggle(t, "featured")} className={`rounded-lg p-2 transition ${t.featured ? "text-gold" : "text-charcoal/30 hover:text-gold"}`} title="Featured" aria-label="Toggle featured">
                    <Star size={16} className={t.featured ? "fill-gold" : ""} />
                  </button>
                  <button onClick={() => toggle(t, "published")} className={`rounded-lg p-2 transition ${t.published ? "text-primary" : "text-charcoal/30 hover:text-primary"}`} title="Show/hide" aria-label="Toggle publish">
                    {t.published ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => { setEditing({ ...t }); setIsNew(false); }} className="rounded-lg bg-primary/10 p-2 text-primary transition hover:bg-primary hover:text-white" aria-label="Edit">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => setDeleting(t)} className="rounded-lg bg-red-50 p-2 text-red-500 transition hover:bg-red-500 hover:text-white" aria-label="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={isNew ? "Add Testimonial" : "Edit Testimonial"}>
        {editing && (
          <form onSubmit={(e) => { e.preventDefault(); save(); }} className="space-y-5">
            <div className="flex items-center gap-4">
              {editing.photo ? (
                <img src={editing.photo} alt="" className="h-20 w-20 rounded-full object-cover" />
              ) : (
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary"><Upload size={22} /></span>
              )}
              <div>
                <label className="btn-outline cursor-pointer !px-4 !py-2 !text-xs">
                  <Upload size={14} /> {editing.photo ? "Change Photo" : "Upload Photo"}
                  <input type="file" accept="image/*" className="hidden" onChange={uploadPhoto} />
                </label>
                {!isNew && <p className="mt-1.5 text-[11px] text-charcoal/40">Photo updates instantly</p>}
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Client name *">
                <input className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required />
              </Field>
              <Field label="Program / role">
                <input className="input" placeholder="e.g. Weight Loss Program" value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })} />
              </Field>
            </div>
            <Field label="Result (optional)" hint="Shown as a badge, e.g. Lost 14 kg in 6 months">
              <input className="input" value={editing.result} onChange={(e) => setEditing({ ...editing, result: e.target.value })} />
            </Field>
            <Field label="Testimonial text *">
              <textarea rows={4} className="input resize-none" value={editing.text} onChange={(e) => setEditing({ ...editing, text: e.target.value })} required />
            </Field>
            <Field label="Rating">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((r) => (
                  <button key={r} type="button" onClick={() => setEditing({ ...editing, rating: r })} aria-label={`${r} stars`}>
                    <Star size={26} className={r <= editing.rating ? "fill-gold text-gold" : "text-gray-300"} />
                  </button>
                ))}
              </div>
            </Field>
            <div className="flex gap-8">
              <label className="flex items-center gap-3 text-sm font-medium text-charcoal/75">
                <Toggle checked={editing.published} onChange={(published) => setEditing({ ...editing, published })} label="Published" /> Published
              </label>
              <label className="flex items-center gap-3 text-sm font-medium text-charcoal/75">
                <Toggle checked={editing.featured} onChange={(featured) => setEditing({ ...editing, featured })} label="Featured" /> Featured
              </label>
            </div>
            <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
              <button type="button" onClick={() => setEditing(null)} className="btn-outline !px-5 !py-2.5 !text-sm">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary !px-6 !py-2.5 !text-sm disabled:opacity-60">
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete testimonial?"
        text={`Testimonial from ${deleting?.name} will be removed.`}
        onConfirm={async () => {
          await api.delete(`/admin/testimonials/${deleting._id}`);
          setDeleting(null);
          load();
          showToast("Testimonial deleted");
        }}
      />
      <Toast message={toast?.message} onClose={() => setToast(null)} />
    </>
  );
}
