import express from "express";
import fs from "fs";
import path from "path";
import { list, del, copy } from "@vercel/blob";
import { UPLOAD_DIR, processUpload, isBlobConfigured, BLOB_PREFIX } from "../../middleware/upload.js";
import GalleryItem from "../../models/GalleryItem.js";
import Blog from "../../models/Blog.js";
import Service from "../../models/Service.js";
import ActivityLog from "../../models/ActivityLog.js";

const router = express.Router();

const MODELS = [GalleryItem, Blog, Service];

const fileNameOf = (url) => {
  const base = String(url || "").split("?")[0];
  return decodeURIComponent(base.split("/").pop() || "");
};

/** List every file in the media library (Blob storage on Vercel, local files otherwise). */
router.get("/", async (_req, res) => {
  try {
    if (isBlobConfigured()) {
      const { blobs } = await list({ prefix: BLOB_PREFIX, limit: 1000 });
      return res.json(
        blobs.map((b) => ({
          name: fileNameOf(b.url),
          url: b.url,
          size: b.size,
          modified: b.uploadedAt,
        }))
      );
    }
  } catch (err) {
    console.error("[media] Blob list failed, falling back:", err.message);
  }
  const files = fs.existsSync(UPLOAD_DIR)
    ? fs.readdirSync(UPLOAD_DIR).map((name) => {
        const stat = fs.statSync(path.join(UPLOAD_DIR, name));
        return {
          name,
          url: `/uploads/${name}`,
          size: stat.size,
          modified: stat.mtime,
        };
      })
    : [];
  res.json(files);
});

/** Generic upload endpoint (also usable from Media Library). */
router.post("/upload", async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const isVideo = /^video\//.test(req.file.mimetype);
    const { url } = await processUpload(req.file, isVideo ? "golz/videos" : "golz/media");
    await ActivityLog.create({ user: req.user.name, action: "Media upload", details: `Uploaded ${req.file.originalname}` });
    res.status(201).json({ url, name: req.file.originalname });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/** Rename a file and update every reference across collections. */
router.put("/rename", async (req, res) => {
  try {
    const { name, newName, url } = req.body;
    if (!name || !newName) return res.status(400).json({ message: "Both names are required" });
    if (!/^[\w.-]+$/.test(newName)) return res.status(400).json({ message: "Invalid file name" });

    let fromUrl, toUrl;
    if (isBlobConfigured()) {
      if (!url) return res.status(400).json({ message: "File URL is required" });
      fromUrl = String(url).split("?")[0];
      const { url: copied } = await copy(fromUrl, `${BLOB_PREFIX}/media/${newName}`, { access: "public" });
      toUrl = copied;
      await del(fromUrl);
    } else {
      fromUrl = `/uploads/${path.basename(name)}`;
      toUrl = `/uploads/${path.basename(newName)}`;
      const from = path.join(UPLOAD_DIR, path.basename(name));
      const to = path.join(UPLOAD_DIR, path.basename(newName));
      if (!fs.existsSync(from)) return res.status(404).json({ message: "File not found" });
      if (fs.existsSync(to)) return res.status(400).json({ message: "A file with that name already exists" });
      fs.renameSync(from, to);
    }

    for (const Model of MODELS) {
      const items = await Model.find({ $or: [{ url: fromUrl }, { thumb: fromUrl }, { cover: fromUrl }] });
      for (const item of items) {
        if (item.url === fromUrl) item.url = toUrl;
        if (item.thumb === fromUrl) item.thumb = toUrl;
        if (item.cover === fromUrl) item.cover = toUrl;
        await item.save();
      }
    }
    await ActivityLog.create({ user: req.user.name, action: "Media renamed", details: `${name} -> ${newName}` });
    res.json({ ok: true, url: toUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/", async (req, res) => {
  try {
    const { name, url } = req.body;
    if (!name && !url) return res.status(400).json({ message: "File name required" });
    if (isBlobConfigured()) {
      if (!url) return res.status(400).json({ message: "File URL required" });
      await del(url);
    } else {
      const file = path.join(UPLOAD_DIR, path.basename(name));
      if (fs.existsSync(file)) fs.unlinkSync(file);
    }
    await ActivityLog.create({ user: req.user.name, action: "Media deleted", details: `Deleted ${name || url}` });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
