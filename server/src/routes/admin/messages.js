import express from "express";
import ContactMessage from "../../models/ContactMessage.js";
import Appointment from "../../models/Appointment.js";
import ActivityLog from "../../models/ActivityLog.js";

const router = express.Router();

function log(user, action, details) {
  return ActivityLog.create({ user, action, details });
}

// ---------- Contact messages ----------
router.get("/", async (req, res) => {
  const { read, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (read === "true") filter.read = true;
  if (read === "false") filter.read = false;
  const [items, total] = await Promise.all([
    ContactMessage.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
    ContactMessage.countDocuments(filter),
  ]);
  res.json({ items, total, page: Number(page), pages: Math.ceil(total / limit) });
});

router.put("/:id", async (req, res) => {
  try {
    const item = await ContactMessage.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Message not found" });
    if (typeof req.body.read === "boolean") item.read = req.body.read;
    if (typeof req.body.replied === "boolean") item.replied = req.body.replied;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const item = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Message not found" });
    await log(req.user.name, "Message deleted", `Deleted message from ${item.name}`);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/export.csv", async (_req, res) => {
  const rows = await ContactMessage.find().sort({ createdAt: -1 });
  const header = "Name,Phone,Email,Subject,Message,Read,Replied,Created At\n";
  const csv = rows.map((m) =>
    [
      `"${(m.name || "").replace(/"/g, '""')}"`,
      `"${(m.phone || "").replace(/"/g, '""')}"`,
      `"${(m.email || "").replace(/"/g, '""')}"`,
      `"${(m.subject || "").replace(/"/g, '""')}"`,
      `"${(m.message || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
      m.read ? "Yes" : "No",
      m.replied ? "Yes" : "No",
      new Date(m.createdAt).toISOString(),
    ].join(",")
  ).join("\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=contact-messages.csv");
  res.send(header + csv);
});

// ---------- Appointments ----------
router.get("/appointments", async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status && status !== "all") filter.status = status;
  const [items, total] = await Promise.all([
    Appointment.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
    Appointment.countDocuments(filter),
  ]);
  res.json({ items, total, page: Number(page), pages: Math.ceil(total / limit) });
});

router.put("/appointments/:id", async (req, res) => {
  try {
    const item = await Appointment.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Appointment not found" });
    if (req.body.status) item.status = req.body.status;
    if (typeof req.body.notes === "string") item.notes = req.body.notes;
    await item.save();
    await log(req.user.name, "Appointment updated", `Set ${item.name}'s request to ${item.status}`);
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/appointments/:id", async (req, res) => {
  try {
    const item = await Appointment.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Appointment not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
