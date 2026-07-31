import { useEffect, useState } from "react";
import { Mail, CalendarCheck, Trash2, Download, MailOpen, Reply, CheckCircle2 } from "lucide-react";
import api from "../api/client";
import SEO from "../components/SEO";
import PageLoader from "../components/PageLoader";
import { Toast, ConfirmDialog, EmptyState } from "./AdminUI";
import { formatDate, downloadBlob } from "../utils/helpers";

function MessageRow({ m, onToggle, onDelete }) {
  return (
    <div className={`rounded-2xl border p-5 transition ${m.read ? "border-gray-100 bg-white" : "border-primary/25 bg-primary/5"}`}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {m.read ? <MailOpen size={16} className="text-charcoal/35" /> : <Mail size={16} className="text-primary" />}
          <p className="font-heading text-sm font-bold text-charcoal">{m.name}</p>
          {!m.read && <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white">NEW</span>}
        </div>
        <span className="text-xs text-charcoal/40">{formatDate(m.createdAt)}</span>
      </div>
      <p className="mb-1 text-sm font-semibold text-charcoal/75">{m.subject || "No subject"}</p>
      <p className="mb-3 text-sm leading-relaxed text-charcoal/60">{m.message}</p>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-charcoal/50">
        <a href={`mailto:${m.email}`} className="hover:text-primary">{m.email}</a>
        <a href={`tel:${m.phone}`} className="hover:text-primary">{m.phone}</a>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
        <button onClick={() => onToggle(m, "read", !m.read)} className="chip !py-1.5 !text-xs">
          {m.read ? <Mail size={13} /> : <MailOpen size={13} />} Mark {m.read ? "Unread" : "Read"}
        </button>
        <button onClick={() => onToggle(m, "replied", !m.replied)} className={`chip !py-1.5 !text-xs ${m.replied ? "chip-active" : ""}`}>
          <Reply size={13} /> {m.replied ? "Replied" : "Mark Replied"}
        </button>
        <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject || "Your enquiry"}`)}`} className="btn-primary !rounded-full !px-4 !py-1.5 !text-xs">
          <Mail size={13} /> Reply by Email
        </a>
        <button onClick={() => onDelete(m)} className="ml-auto rounded-lg bg-red-50 p-2 text-red-500 transition hover:bg-red-500 hover:text-white" aria-label="Delete message">
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

function AppointmentRow({ a, onStatus, onDelete }) {
  const statuses = ["pending", "confirmed", "completed", "cancelled"];
  const colors = { pending: "bg-gold/15 text-gold", confirmed: "bg-primary/10 text-primary", completed: "bg-blue-500/10 text-blue-600", cancelled: "bg-red-50 text-red-500" };
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="font-heading text-sm font-bold text-charcoal">{a.name}</p>
        <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase ${colors[a.status] || colors.pending}`}>{a.status}</span>
      </div>
      <div className="mb-3 grid gap-1 text-sm text-charcoal/60 sm:grid-cols-2">
        <span>Service: <b className="font-semibold text-charcoal">{a.service || "General consultation"}</b></span>
        <span>Preferred: {a.preferredDate || "Anytime"} {a.preferredTime && `• ${a.preferredTime}`}</span>
        <span className="sm:col-span-2">Contact: {a.phone} {a.email && `• ${a.email}`}</span>
        {a.message && <span className="sm:col-span-2 text-xs italic">{a.message}</span>}
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3">
        {statuses.map((s) => (
          <button key={s} onClick={() => onStatus(a, s)} className={`chip !py-1.5 !text-xs capitalize ${a.status === s ? "chip-active" : ""}`}>{s}</button>
        ))}
        <button onClick={() => onDelete(a)} className="ml-auto rounded-lg bg-red-50 p-2 text-red-500 transition hover:bg-red-500 hover:text-white" aria-label="Delete appointment">
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

export default function MessagesAdmin() {
  const [tab, setTab] = useState("messages");
  const [msgs, setMsgs] = useState(null);
  const [appts, setAppts] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState(null);

  const loadMessages = () => api.get("/admin/messages", { params: { limit: 100 } }).then(({ data }) => setMsgs(data));
  const loadAppointments = () => api.get("/admin/messages/appointments", { params: { limit: 100 } }).then(({ data }) => setAppts(data));

  useEffect(() => {
    loadMessages();
    loadAppointments();
  }, []);

  const showToast = (message) => { setToast({ message }); setTimeout(() => setToast(null), 3000); };

  const toggle = async (m, field, value) => {
    await api.put(`/admin/messages/${m._id}`, { [field]: value });
    loadMessages();
  };

  const setStatus = async (a, status) => {
    await api.put(`/admin/messages/appointments/${a._id}`, { status });
    loadAppointments();
  };

  const exportCsv = async () => {
    const res = await api.get("/admin/messages/export.csv");
    downloadBlob(res.data, "contact-messages.csv", "text/csv");
    showToast("CSV downloaded");
  };

  return (
    <>
      <SEO title="Messages & Appointments" />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          <button onClick={() => setTab("messages")} className={`chip ${tab === "messages" ? "chip-active" : ""}`}>
            <Mail size={15} /> Messages {msgs && `(${msgs.items.length})`}
          </button>
          <button onClick={() => setTab("appointments")} className={`chip ${tab === "appointments" ? "chip-active" : ""}`}>
            <CalendarCheck size={15} /> Appointments {appts && `(${appts.items.length})`}
          </button>
        </div>
        {tab === "messages" && (
          <button onClick={exportCsv} className="btn-outline !px-5 !py-2.5 !text-sm">
            <Download size={16} /> Export CSV
          </button>
        )}
      </div>

      {tab === "messages" ? (
        !msgs ? (
          <PageLoader />
        ) : msgs.items.length === 0 ? (
          <EmptyState text="No contact messages yet." />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {msgs.items.map((m) => <MessageRow key={m._id} m={m} onToggle={toggle} onDelete={setDeleting} />)}
          </div>
        )
      ) : !appts ? (
        <PageLoader />
      ) : appts.items.length === 0 ? (
        <EmptyState text="No appointment requests yet." />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {appts.items.map((a) => <AppointmentRow key={a._id} a={a} onStatus={setStatus} onDelete={setDeleting} />)}
        </div>
      )}

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete this item?"
        text="This cannot be undone."
        onConfirm={async () => {
          const isAppt = deleting.service !== undefined;
          await api.delete(isAppt ? `/admin/appointments/${deleting._id}` : `/admin/messages/${deleting._id}`);
          setDeleting(null);
          loadMessages();
          loadAppointments();
          showToast("Deleted");
        }}
      />
      <Toast message={toast?.message} onClose={() => setToast(null)} />
    </>
  );
}
