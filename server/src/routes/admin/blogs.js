import express from "express";
import Blog from "../../models/Blog.js";
import ActivityLog from "../../models/ActivityLog.js";
import { slugify, estimateReadingTime } from "../../utils/helpers.js";

const router = express.Router();

function log(user, action, details) {
  return ActivityLog.create({ user, action, details });
}

router.get("/", async (req, res) => {
  const { search, status, page = 1, limit = 10 } = req.query;
  const filter = {};
  if (search) filter.$or = [{ title: { $regex: search, $options: "i" } }, { category: { $regex: search, $options: "i" } }];
  if (status === "published") filter.published = true;
  if (status === "draft") filter.published = false;
  const [items, total] = await Promise.all([
    Blog.find(filter).sort({ updatedAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
    Blog.countDocuments(filter),
  ]);
  res.json({ items, total, page: Number(page), pages: Math.ceil(total / limit) });
});

router.get("/:id", async (req, res) => {
  const item = await Blog.findById(req.params.id);
  if (!item) return res.status(404).json({ message: "Blog not found" });
  res.json(item);
});

router.post("/", async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.title) return res.status(400).json({ message: "Title is required" });
    data.slug = slugify(data.slug || data.title);
    const existing = await Blog.findOne({ slug: data.slug });
    if (existing) data.slug = `${data.slug}-${Date.now().toString().slice(-4)}`;
    data.readingTime = estimateReadingTime(data.content);
    if (data.published && !data.scheduledAt) data.publishedAt = data.publishedAt || new Date();
    const item = await Blog.create(data);
    await log(req.user.name, "Blog created", `Created "${item.title}"`);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const item = await Blog.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Blog not found" });
    const data = { ...req.body };
    delete data._id;
    if (data.slug) data.slug = slugify(data.slug);
    data.readingTime = estimateReadingTime(data.content ?? item.content);
    if (data.published && !item.publishedAt && !data.scheduledAt) data.publishedAt = new Date();
    Object.assign(item, data);
    await item.save();
    await log(req.user.name, "Blog updated", `Updated "${item.title}"`);
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/:id/duplicate", async (req, res) => {
  try {
    const src = await Blog.findById(req.params.id);
    if (!src) return res.status(404).json({ message: "Blog not found" });
    const copy = src.toObject();
    delete copy._id;
    copy.title = `${src.title} (Copy)`;
    copy.slug = `${src.slug}-copy-${Date.now().toString().slice(-4)}`;
    copy.published = false;
    copy.publishedAt = null;
    copy.views = 0;
    const item = await Blog.create(copy);
    await log(req.user.name, "Blog duplicated", `Duplicated "${src.title}"`);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const item = await Blog.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Blog not found" });
    await log(req.user.name, "Blog deleted", `Deleted "${item.title}"`);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
