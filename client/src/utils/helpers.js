export function formatDate(input) {
  if (!input) return "";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return String(input);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function formatMoney(price, currency = "₹") {
  if (price === null || price === undefined || price === "") return "Price on request";
  return `${currency}${Number(price).toLocaleString("en-IN")}`;
}

export function truncate(text, len = 120) {
  if (!text) return "";
  return text.length > len ? `${text.slice(0, len).trim()}…` : text;
}

export function stripHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return div.textContent || "";
}

export function downloadBlob(content, filename, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function toError(message) {
  const msg = message?.response?.data?.message || message?.message || "Something went wrong";
  return msg;
}

export function slugify(str) {
  return String(str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

import {
  Flame, Dumbbell, HeartPulse, Flower2, Baby, Medal, Smile, Heart,
  Building2, Pill, Salad, ShieldCheck, Sparkles, Utensils, FlaskConical,
  Wallet, RefreshCcw, UserCheck, TrendingUp, Award, HeartHandshake,
  ClipboardCheck, Clock, Apple, Activity, Leaf, Star, Users, Stethoscope,
  Scale, Brain, Accessibility, Cross, Dna, PersonStanding, Footprints,
} from "lucide-react";

const ICONS = {
  Flame, Dumbbell, HeartPulse, Flower2, Baby, Medal, Smile, Heart,
  Building2, Pill, Salad, ShieldCheck, Sparkles, Utensils, FlaskConical,
  Wallet, RefreshCcw, UserCheck, TrendingUp, Award, HeartHandshake,
  ClipboardCheck, Clock, Apple, Activity, Leaf, Star, Users, Stethoscope,
  Scale, Brain, Accessibility, Cross, Dna, PersonStanding, Footprints,
};

export const ICON_MAP = new Map(Object.entries(ICONS));

export function loadIconMap() {
  return Promise.resolve(ICON_MAP);
}
