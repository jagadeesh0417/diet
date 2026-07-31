import { useEffect, useState } from "react";
import {
  CalendarCheck, Newspaper, Images, Users, MessageSquare, Star, Eye, Activity, Inbox,
} from "lucide-react";
import api from "../api/client";
import SEO from "../components/SEO";
import PageLoader from "../components/PageLoader";
import { StatCard, EmptyState } from "./AdminUI";
import { formatDate } from "../utils/helpers";

function MiniBarChart({ data }) {
  const max = Math.max(...data.map((d) => d.visits), 1);
  return (
    <div className="flex h-48 items-end gap-1.5">
      {data.map((d) => (
        <div key={d.date} className="group relative flex-1">
          <div
            className="w-full rounded-t-md bg-gradient-to-t from-primary to-sage transition-all hover:from-primary-dark"
            style={{ height: `${Math.max((d.visits / max) * 100, 2)}%` }}
          />
          <div className="pointer-events-none absolute -top-9 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-charcoal px-2 py-1 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
            {d.visits} visits
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get("/admin/dashboard").then(({ data }) => setData(data));
  }, []);

  if (!data) return <PageLoader label="Loading dashboard…" />;
  const { stats, visitorChart, topPages, activities, recentMessages, recentAppointments } = data;

  return (
    <>
      <SEO title="Dashboard" />
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Appointments" value={stats.appointments} icon={CalendarCheck} />
        <StatCard label="Total Blog Posts" value={stats.blogs} icon={Newspaper} color="bg-gold/10 text-gold" />
        <StatCard label="Gallery Items" value={stats.gallery} icon={Images} color="bg-accent/10 text-accent" />
        <StatCard label="Visitors Today" value={stats.visitorsToday} icon={Eye} color="bg-blue-500/10 text-blue-600" />
        <StatCard label="Contact Messages" value={stats.contacts} icon={MessageSquare} color="bg-purple-500/10 text-purple-600" />
        <StatCard label="Testimonials" value={stats.testimonials} icon={Star} color="bg-pink-500/10 text-pink-600" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="card p-6">
          <h2 className="mb-6 flex items-center gap-2 font-heading text-lg font-bold text-charcoal">
            <Activity size={19} className="text-primary" /> Visitor Analytics (last 14 days)
          </h2>
          <MiniBarChart data={visitorChart} />
          <div className="mt-4 flex justify-between text-[10px] text-charcoal/40">
            <span>{visitorChart[0]?.date}</span>
            <span>{visitorChart[visitorChart.length - 1]?.date}</span>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="mb-4 font-heading text-lg font-bold text-charcoal">Top Pages</h2>
          {topPages.length === 0 ? (
            <EmptyState text="No visits recorded yet" />
          ) : (
            <ul className="space-y-3">
              {topPages.map((p, i) => (
                <li key={p._id} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                  <span className="flex-1 truncate font-mono text-xs text-charcoal/70">{p._id}</span>
                  <span className="font-heading text-sm font-bold text-charcoal">{p.total}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-bold text-charcoal">
            <Inbox size={18} className="text-primary" /> Recent Messages
          </h2>
          {recentMessages.length === 0 ? (
            <EmptyState text="No messages yet" />
          ) : (
            <ul className="divide-y divide-gray-50">
              {recentMessages.map((m) => (
                <li key={m._id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-semibold text-charcoal">
                      {m.name}
                      {!m.read && <span className="h-2 w-2 rounded-full bg-accent" />}
                    </p>
                    <p className="truncate text-xs text-charcoal/50">{m.subject || m.message}</p>
                  </div>
                  <span className="shrink-0 text-xs text-charcoal/40">{formatDate(m.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-bold text-charcoal">
            <Users size={18} className="text-primary" /> Recent Activity
          </h2>
          {activities.length === 0 ? (
            <EmptyState text="No recent activity" />
          ) : (
            <ul className="max-h-80 space-y-3 overflow-y-auto admin-scroll pr-2">
              {activities.map((a) => (
                <li key={a._id} className="flex items-start gap-3 rounded-2xl bg-gray-50 p-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-charcoal">{a.action}</p>
                    <p className="truncate text-xs text-charcoal/50">{a.details || a.user}</p>
                    <p className="mt-0.5 text-[10px] text-charcoal/35">{formatDate(a.createdAt)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
