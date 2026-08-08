import express from "express";
import Service from "../../models/Service.js";
import ActivityLog from "../../models/ActivityLog.js";
import { slugify } from "../../utils/helpers.js";
import { processUpload } from "../../middleware/upload.js";
import { ensureMediaRecord } from "../../utils/media.js";

const router = express.Router();

function log(user, action, details) {
  return ActivityLog.create({ user, action, details });
}

router.get("/", async (_req, res) => {
  res.json(await Service.find().sort({ order: 1, createdAt: 1 }));
});

router.get("/:id", async (req, res) => {
  const item = await Service.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Service not found" });
  res.json(item);
});

router.post("/", async (req, res) => {
  try {
    const data = { ...req.body };
    data.slug = slugify(data.slug || data.title);
    if (!data.title) return res.status(400).json({ message: "Title is required" });
    const existing = await Service.findOne({ slug: data.slug });
    if (existing) data.slug = `${data.slug}-${Date.now().toString().slice(-4)}`;
    const maxOrder = await Service.findOne().sort({ order: -1 });
    data.order = (maxOrder?.order ?? 0) + 1;
    const item = await Service.create(data);
    await log(req.user.name, "Service created", `Created "${item.title}"`);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const item = await Service.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Service not found" });
    const data = { ...req.body };
    if (data.slug) data.slug = slugify(data.slug);
    if (data.title) data.slug = slugify(data.slug || data.title);
    Object.assign(item, data);
    await item.save();
    await log(req.user.name, "Service updated", `Updated "${item.title}"`);
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/image", async (req, res) => {
  try {
    const item = await Service.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Service not found" });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const upload = await processUpload(req.file, "golz/services");
    await ensureMediaRecord({ file: req.file, upload, user: req.user });
    item.image = upload.url;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/reorder", async (req, res) => {
  try {
    const ids = req.body.ids || [];
    for (let i = 0; i < ids.length; i++) {
      await Service.updateOne({ _id: ids[i] }, { $set: { order: i + 1 } });
    }
    await log(req.user.name, "Services reordered", "Changed service order");
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const item = await Service.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Service not found" });
    await log(req.user.name, "Service deleted", `Deleted "${item.title}"`);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
