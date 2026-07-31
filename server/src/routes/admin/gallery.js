import express from "express";
import GalleryItem from "../../models/GalleryItem.js";
import ActivityLog from "../../models/ActivityLog.js";
import { processUpload } from "../../middleware/upload.js";

const router = express.Router();

function log(user, action, details) {
  return ActivityLog.create({ user, action, details });
}

router.get("/", async (req, res) => {
  const { category, type } = req.query;
  const filter = {};
  if (category && category !== "All") filter.category = category;
  if (type && type !== "All") filter.type = type;
  res.json(await GalleryItem.find(filter).sort({ order: 1, featured: -1, createdAt: -1 }));
});

router.get("/categories", async (_req, res) => {
  res.json(await GalleryItem.distinct("category"));
});

router.post("/", async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.url && !req.file) return res.status(400).json({ message: "Image or video is required" });
    if (req.file) {
      const isVideo = /^video\//.test(req.file.mimetype);
      const { url, thumb } = await processUpload(req.file, isVideo ? "golz/videos" : "golz/gallery");
      data.url = url;
      data.thumb = thumb;
      data.type = isVideo ? "video" : "image";
    }
    const maxOrder = await GalleryItem.findOne().sort({ order: -1 });
    data.order = (maxOrder?.order ?? 0) + 1;
    const item = await GalleryItem.create(data);
    await log(req.user.name, "Gallery item added", `Added ${item.type} in "${item.category}"`);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/upload", async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const isVideo = /^video\//.test(req.file.mimetype);
    const { url, thumb } = await processUpload(req.file, isVideo ? "golz/videos" : "golz/gallery");
    const maxOrder = await GalleryItem.findOne().sort({ order: -1 });
    const item = await GalleryItem.create({
      type: isVideo ? "video" : "image",
      url,
      thumb,
      category: req.body.category || "General",
      caption: req.body.caption || "",
      alt: req.body.alt || "",
      order: (maxOrder?.order ?? 0) + 1,
      published: true,
    });
    await log(req.user.name, "Gallery upload", `Uploaded ${item.type}`);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const item = await GalleryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    Object.assign(item, req.body);
    await item.save();
    await log(req.user.name, "Gallery item updated", `Updated ${item.type}`);
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/reorder", async (req, res) => {
  try {
    const ids = req.body.ids || [];
    for (let i = 0; i < ids.length; i++) {
      await GalleryItem.updateOne({ _id: ids[i] }, { $set: { order: i + 1 } });
    }
    await log(req.user.name, "Gallery reordered", "Changed gallery order");
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const item = await GalleryItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    await log(req.user.name, "Gallery item deleted", `Deleted ${item.type}`);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/bulk-delete", async (req, res) => {
  try {
    const ids = req.body.ids || [];
    await GalleryItem.deleteMany({ _id: { $in: ids } });
    await log(req.user.name, "Gallery bulk delete", `Deleted ${ids.length} items`);
    res.json({ ok: true, deleted: ids.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
