import { useEffect, useRef, useState } from "react";
import {
  Upload, Trash2, Pencil, Copy, Check, Search, ExternalLink, FolderOpen, Film, FileImage, CheckSquare, Square,
} from "lucide-react";
import api from "../api/client";
import SEO from "../components/SEO";
import PageLoader from "../components/PageLoader";
import ImgFallback from "../components/ImgFallback";
import { Modal, ConfirmDialog, Toast, EmptyState } from "./AdminUI";
import { formatDate } from "../utils/helpers";

export default function MediaAdmin() {
  const [files, setFiles] = useState(null);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [toast, setToast] = useState(null);
  const [uploading, setUploading] = useState(0);
  const [renaming, setRenaming] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [bulkDelete, setBulkDelete] = useState(false);
  const [preview, setPreview] = useState(null);
  const [copied, setCopied] = useState(null);
  const fileRef = useRef(null);

  const load = () =>
    api.get("/admin/media").then(({ data }) => { setFiles(data); setSelected(new Set()); }).catch(() => {
      showToast("Failed to load media library", "error");
      setFiles([]);
    });

  useEffect(() => {
    load();
  }, []);

  const showToast = (message, type = "success") => { setToast({ message, type }); setTimeout(() => setToast(null), 3000); };

  const uploadFiles = async (list) => {
    setUploading(list.length);
    const failed = [];
    for (const file of list) {
      const form = new FormData();
      form.append("file", file);
      try {
        await api.post("/admin/media/upload", form);
      } catch (err) {
        failed.push({ name: file.name, message: err.response?.data?.message || "Upload failed" });
      }
      setUploading((u) => u - 1);
    }
    if (failed.length === 0) {
      showToast(`Uploaded ${list.length} file${list.length > 1 ? "s" : ""}`);
    } else if (failed.length === list.length) {
      showToast(`Upload failed: ${failed[0].message}`, "error");
    } else {
      showToast(`${list.length - failed.length} uploaded, ${failed.length} failed (e.g. ${failed[0].name}: ${failed[0].message})`, "error");
    }
    load();
  };

  const copyUrl = async (url) => {
    const full = /^https?:\/\//.test(url) ? url : `${window.location.origin}${url}`;
    try { await navigator.clipboard.writeText(full); setCopied(url); setTimeout(() => setCopied(null), 1600); } catch { /* noop */ }
  };

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const visible = (files || []).filter((f) => !search || f.name.toLowerCase().includes(search.toLowerCase()));
  const images = visible.filter((f) => /\.(jpe?g|png|webp|gif|avif)$/i.test(f.name));
  const videos = visible.filter((f) => /\.(mp4|webm|mov)$/i.test(f.name));
  const allVisibleSelected = visible.length > 0 && visible.every((f) => selected.has(f._id));

  const toggleSelectAll = () => {
    setSelected((prev) => {
      if (allVisibleSelected) return new Set();
      const next = new Set(prev);
      visible.forEach((f) => next.add(f._id));
      return next;
    });
  };

  return (
    <>
      <SEO title="Media Library" />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search files…" aria-label="Search media files" className="input !py-2.5 !pl-10" />
        </div>
        <div className="flex items-center gap-3">
          {selected.size > 0 && (
            <button onClick={() => setBulkDelete(true)} className="btn-primary !bg-red-500 !px-5 !py-2.5 !text-sm hover:!bg-red-600">
              <Trash2 size={15} /> Delete selected ({selected.size})
            </button>
          )}
          <button onClick={() => fileRef.current?.click()} disabled={uploading > 0} className="btn-primary !px-5 !py-2.5 !text-sm disabled:opacity-60">
            <Upload size={16} /> {uploading > 0 ? `Uploading ${uploading}…` : "Upload Files"}
          </button>
        </div>
        <input ref={fileRef} type="file" multiple accept="image/*,video/*" className="hidden"
          onChange={(e) => { const list = Array.from(e.target.files || []); if (list.length) uploadFiles(list); e.target.value = ""; }} />
      </div>

      {!files ? (
        <PageLoader />
      ) : visible.length === 0 ? (
        <EmptyState text="No files yet. Upload images or videos to build your media library." />
      ) : (
        <>
          <button
            onClick={toggleSelectAll}
            className="mb-3 flex items-center gap-2 rounded-lg px-2 py-1 text-xs font-semibold text-charcoal/55 transition hover:text-primary"
          >
            {allVisibleSelected ? <CheckSquare size={14} className="text-primary" /> : <Square size={14} />}
            {allVisibleSelected ? "Deselect all" : `Select all (${visible.length})`}
          </button>

          {images.length > 0 && (
            <>
              <h2 className="mb-3 flex items-center gap-2 font-heading text-sm font-semibold text-charcoal/60">
                <FileImage size={15} className="text-primary" /> Images ({images.length})
              </h2>
              <div className="mb-8 columns-2 gap-4 sm:columns-3 lg:columns-4 xl:columns-5">
                {images.map((f) => (
                  <div key={f._id} className={`group relative mb-4 break-inside-avoid overflow-hidden rounded-2xl border bg-white shadow-card ${selected.has(f._id) ? "border-primary ring-2 ring-primary/30" : "border-gray-100"}`}>
                    <button onClick={() => setPreview(f)} className="block w-full" aria-label={`Preview ${f.name}`}>
                      <ImgFallback src={f.url} alt={f.name} className="h-auto w-full object-contain" fallbackClassName="aspect-square" />
                    </button>
                    <button
                      onClick={() => toggleSelect(f._id)}
                      className={`absolute left-2 top-2 rounded-md p-1.5 shadow transition ${selected.has(f._id) ? "bg-primary text-white" : "bg-white/90 text-charcoal hover:bg-primary hover:text-white"}`}
                      aria-label={selected.has(f._id) ? "Deselect file" : "Select file"}
                    >
                      {selected.has(f._id) ? <CheckSquare size={14} /> : <Square size={14} />}
                    </button>
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-charcoal/85 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                      <button onClick={() => copyUrl(f.url)} className="rounded-lg bg-white/15 p-1.5 text-white hover:bg-primary" title="Copy URL" aria-label="Copy URL">
                        {copied === f.url ? <Check size={13} /> : <Copy size={13} />}
                      </button>
                      <div className="flex gap-1">
                        <button onClick={() => setRenaming(f)} className="rounded-lg bg-white/15 p-1.5 text-white hover:bg-gold" title="Rename" aria-label="Rename file">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => setDeleting(f)} className="rounded-lg bg-white/15 p-1.5 text-white hover:bg-red-500" title="Delete" aria-label="Delete file">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {videos.length > 0 && (
            <>
              <h2 className="mb-3 flex items-center gap-2 font-heading text-sm font-semibold text-charcoal/60">
                <Film size={15} className="text-primary" /> Videos ({videos.length})
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {videos.map((f) => (
                  <div key={f._id} className={`flex items-center gap-3 rounded-2xl border bg-white p-3 shadow-card ${selected.has(f._id) ? "border-primary ring-2 ring-primary/30" : "border-gray-100"}`}>
                    <video src={f.url} className="h-16 w-24 shrink-0 rounded-xl bg-charcoal object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-charcoal">{f.name}</p>
                      <p className="text-xs text-charcoal/45">{formatDate(f.modified)} • {(f.size / 1024 / 1024).toFixed(1)} MB</p>
                    </div>
                    <button
                      onClick={() => toggleSelect(f._id)}
                      className={`rounded-md p-1.5 ${selected.has(f._id) ? "bg-primary text-white" : "text-charcoal/50 hover:bg-primary/10 hover:text-primary"}`}
                      aria-label={selected.has(f._id) ? "Deselect file" : "Select file"}
                    >
                      {selected.has(f._id) ? <CheckSquare size={14} /> : <Square size={14} />}
                    </button>
                    <div className="flex gap-1">
                      <button onClick={() => copyUrl(f.url)} className="rounded-lg p-1.5 text-charcoal/50 hover:bg-primary/10 hover:text-primary" title="Copy URL" aria-label="Copy URL">
                        {copied === f.url ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                      <button onClick={() => setDeleting(f)} className="rounded-lg p-1.5 text-charcoal/50 hover:bg-red-50 hover:text-red-500" title="Delete" aria-label="Delete file">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {files && files.length > 0 && (
        <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-charcoal/40">
          <FolderOpen size={13} /> {files.length} files in library • Hover a tile for actions
        </p>
      )}

      {/* Rename modal */}
      <Modal open={!!renaming} onClose={() => setRenaming(null)} title="Rename file">
        {renaming && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const newName = e.target.newName.value.trim();
              if (!newName) return;
              try {
                await api.put("/admin/media/rename", { _id: renaming._id, newName });
                setRenaming(null);
                showToast("File renamed");
                load();
              } catch (err) {
                showToast(err.response?.data?.message || "Rename failed", "error");
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="label" htmlFor="newName">New file name (keep the extension)</label>
              <input id="newName" name="newName" className="input" defaultValue={renaming.name} required />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setRenaming(null)} className="btn-outline !px-5 !py-2.5 !text-sm">Cancel</button>
              <button type="submit" className="btn-primary !px-5 !py-2.5 !text-sm">Rename</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Preview modal */}
      <Modal open={!!preview} onClose={() => setPreview(null)} title={preview?.name} wide>
        {preview && (
          <div>
            {/\.(mp4|webm|mov)$/i.test(preview.name) ? (
              <video src={preview.url} controls className="w-full rounded-2xl bg-charcoal" />
            ) : (
              <ImgFallback src={preview.url} alt={preview.name} className="max-h-[70vh] w-full rounded-2xl object-contain bg-charcoal/5" />
            )}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
              <p className="text-charcoal/60">
                {formatDate(preview.modified)} • {(preview.size / 1024).toFixed(0)} KB
              </p>
              <div className="flex gap-2">
                <button onClick={() => copyUrl(preview.url)} className="btn-outline !px-4 !py-2 !text-xs">
                  {copied === preview.url ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy URL</>}
                </button>
                <a href={preview.url} target="_blank" rel="noopener noreferrer" className="btn-primary !px-4 !py-2 !text-xs">
                  <ExternalLink size={14} /> Open
                </a>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Single delete — one media ID at a time */}
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete this file?"
        text="Only this file will be removed. Items referencing it on the site may break."
        onConfirm={async () => {
          try {
            await api.delete(`/admin/media/${deleting._id}`);
            showToast("File deleted");
          } catch (err) {
            showToast(err.response?.data?.message || "Delete failed", "error");
          }
          setDeleting(null);
          load();
        }}
      />

      {/* Bulk delete — explicit IDs only */}
      <ConfirmDialog
        open={bulkDelete}
        onClose={() => setBulkDelete(false)}
        title={`Delete ${selected.size} selected files?`}
        text="Only the selected files will be removed."
        onConfirm={async () => {
          try {
            const ids = [...selected];
            await api.delete("/admin/media", { data: { ids } });
            showToast(`${ids.length} files deleted`);
          } catch (err) {
            showToast(err.response?.data?.message || "Delete failed", "error");
          }
          setBulkDelete(false);
          load();
        }}
      />
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </>
  );
}
