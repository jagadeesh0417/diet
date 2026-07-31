import Visitor from "../models/Visitor.js";
import { todayKey } from "../utils/helpers.js";

/**
 * Lightweight visitor analytics — client pings /api/public/visit on route changes.
 */
export async function trackVisit(req, res) {
  try {
    const path = String(req.body?.path || req.headers.referer || "/").replace(/^https?:\/\/[^/]+/, "");
    const date = todayKey();
    await Visitor.updateOne(
      { date, path },
      { $inc: { count: 1 } },
      { upsert: true }
    );
    res.json({ ok: true });
  } catch {
    res.json({ ok: true });
  }
}
