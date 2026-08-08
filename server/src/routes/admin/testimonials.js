import express from "express";
import Testimonial from "../../models/Testimonial.js";
import ActivityLog from "../../models/ActivityLog.js";
import { processUpload } from "../../middleware/upload.js";
import { ensureMediaRecord } from "../../utils/media.js";

const router = express.Router();

function log(user, action, details) {
  return ActivityLog.create({ user, action, details });
}

router.get("/", async (_req, res) => {
  res.json(await Testimonial.find().sort({ featured: -1, createdAt: -1 }));
});

router.post("/", async (req, res) => {
  try {
    if (!req.body.name || !req.body.text) return res.status(400).json({ message: "Name and testimonial text are required" });
    const item = await Testimonial.create(req.body);
    await log(req.user.name, "Testimonial added", `Added testimonial from ${item.name}`);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/photo", async (req, res) => {
  try {
    const item = await Testimonial.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Testimonial not found" });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const upload = await processUpload(req.file, "golz/testimonials");
    await ensureMediaRecord({ file: req.file, upload, user: req.user });
    item.photo = upload.url;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const item = await Testimonial.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Testimonial not found" });
    Object.assign(item, req.body);
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const item = await Testimonial.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Testimonial not found" });
    await log(req.user.name, "Testimonial deleted", `Deleted testimonial from ${item.name}`);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
