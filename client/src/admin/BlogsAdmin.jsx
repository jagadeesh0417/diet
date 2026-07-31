import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Copy, Eye, EyeOff, CalendarClock } from "lucide-react";
import api from "../api/client";
import SEO from "../components/SEO";
import PageLoader from "../components/PageLoader";
import { ConfirmDialog, Toast, EmptyState } from "./AdminUI";
import { formatDate } from "../utils/helpers";

const FILTERS = [
  { key: "", label: "All" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" },
];

export default function BlogsAdmin() {
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const load = (f = filter, q = search) => {
    setData(null);
    api.get("/admin/blogs", { params: { status: f, search: q } }).then(({ data }) => setData(data));
  };

  useEffect(() => {
    const t = setTimeout(() => load(filter, search), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, search]);

  const showToast = (message) => { setToast({ message }); setTimeout(() => setToast(null), 3000); };

  const duplicate = async (blog) => {
    const { data: copy } = await api.post(`/admin/blogs/${blog._id}/duplicate`);
    showToast("Duplicated — editing copy");
    navigate(`/admin/blogs/${copy._id}`);
  };

  const togglePublish = async (blog) => {
    await api.put(`/admin/blogs/${blog._id}`, { published: !blog.published });
    load();
  };

  return (
    <>
      <SEO title="Blogs" />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)} className={`chip ${filter === f.key ? "chip-active" : ""}`}>{f.label}</button>
          ))}
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title…" className="input !w-56 !py-2" />
        </div>
        <Link to="/admin/blogs/new" className="btn-primary !px-5 !py-2.5 !text-sm"><Plus size={17} /> New Blog</Link>
      </div>

      {!data ? (
        <PageLoader />
      ) : data.items.length === 0 ? (
        <EmptyState text="No posts found. Create your first article!" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.items.map((b) => (
            <div key={b._id} className="card group overflow-hidden">
              <div className="relative h-40 overflow-hidden">
                <img src={b.cover} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 to-transparent" />
                <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-semibold text-white ${b.published ? "bg-primary" : "bg-charcoal/70"}`}>
                  {b.published ? (b.scheduledAt ? "Scheduled" : "Published") : "Draft"}
                </span>
                {b.featured && <span className="absolute right-3 top-3 rounded-full bg-gold px-3 py-1 text-xs font-bold text-white">Featured</span>}
                <p className="absolute bottom-3 left-3 right-3 font-heading text-sm font-bold leading-snug text-white">{b.title}</p>
              </div>
              <div className="p-4">
                <div className="mb-3 flex items-center justify-between text-[11px] text-charcoal/45">
                  <span>{b.category} • {b.readingTime} min</span>
                  <span>{formatDate(b.updatedAt)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => navigate(`/admin/blogs/${b._id}`)} className="flex-1 rounded-xl bg-primary/10 py-2 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white" title="Edit">
                    <Pencil size={13} className="mx-auto" />
                  </button>
                  <button onClick={() => togglePublish(b)} className="flex-1 rounded-xl bg-gray-100 py-2 text-charcoal/60 transition hover:bg-charcoal hover:text-white" title={b.published ? "Unpublish" : "Publish"}>
                    {b.published ? <EyeOff size={13} className="mx-auto" /> : <Eye size={13} className="mx-auto" />}
                  </button>
                  <button onClick={() => duplicate(b)} className="flex-1 rounded-xl bg-gray-100 py-2 text-charcoal/60 transition hover:bg-charcoal hover:text-white" title="Duplicate">
                    <Copy size={13} className="mx-auto" />
                  </button>
                  <button onClick={() => setDeleting(b)} className="flex-1 rounded-xl bg-red-50 py-2 text-red-500 transition hover:bg-red-500 hover:text-white" title="Delete">
                    <Trash2 size={13} className="mx-auto" />
                  </button>
                </div>
                {b.scheduledAt && (
                  <p className="mt-3 flex items-center gap-1.5 text-[11px] text-gold">
                    <CalendarClock size={12} /> Scheduled for {formatDate(b.scheduledAt)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete post?"
        text={`"${deleting?.title}" will be permanently removed.`}
        onConfirm={async () => {
          await api.delete(`/admin/blogs/${deleting._id}`);
          setDeleting(null);
          load();
          showToast("Post deleted");
        }}
      />
      <Toast message={toast?.message} onClose={() => setToast(null)} />
    </>
  );
}
