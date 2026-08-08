import express from "express";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { list, copy, head, BlobNotFoundError } from "@vercel/blob";
import { UPLOAD_DIR, processUpload, isBlobConfigured, BLOB_PREFIX } from "../../middleware/upload.js";
import Media from "../../models/Media.js";
import GalleryItem from "../../models/GalleryItem.js";
import Blog from "../../models/Blog.js";
import Service from "../../models/Service.js";
import ActivityLog from "../../models/ActivityLog.js";
import { getMediaUrl, removeStoredFile, ensureMediaRecord } from "../../utils/media.js";

const router = express.Router();

const MODELS = [GalleryItem, Blog, Service];

const fileNameOf = (url) => {
  const base = String(url || "").split("?")[0];
  return decodeURIComponent(base.split("/").pop() || "");
};

const BLOB_URL_RE = /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i;
const isStoredUrl = (url) => BLOB_URL_RE.test(String(url || ""));

const validId = (id) => mongoose.Types.ObjectId.isValid(id);

/** True when the file exists in blob storage (false on 404, throws on real errors). */
async function blobExists(url) {
  try {
    await head(url);
    return true;
  } catch (err) {
    if (err instanceof BlobNotFoundError || err?.status === 404) return false;
    throw err;
  }
}

/**
 * Idempotent backfill: creates Media records for blob files that predate the
 * record layer, so the library never silently loses files.
 */
async function backfillBlobRecords() {
  if (!isBlobConfigured()) return;
  const { blobs } = await list({ prefix: BLOB_PREFIX, limit: 1000 });
  const existing = new Set(
    (await Media.find({ storage: "blob", storageKey: { $ne: "" } }).select("storageKey").lean()).map((m) => m.storageKey)
  );
  for (const b of blobs) {
    if (existing.has(b.pathname)) continue;
    const isVideo = /^video\//.test(b.contentType || "");
    await Media.create({
      filename: fileNameOf(b.url),
      url: b.url,
      storage: "blob",
      storageKey: b.pathname,
      resourceType: isVideo ? "video" : "image",
      contentType: b.contentType || "",
      size: b.size || 0,
      uploadedBy: "",
      gallerySectionId: "",
    });
  }
}

/** List every media record (Blob-backed on Vercel, local files otherwise). */
router.get("/", async (_req, res) => {
  try {
    await backfillBlobRecords();
    const records = await Media.find().sort({ createdAt: -1 });
    res.json(
      records.map((m) => ({
        _id: m._id,
        name: m.filename,
        url: getMediaUrl(m),
        thumb: getMediaUrl({ ...m.toObject(), url: m.thumb }),
        size: m.size,
        modified: m.updatedAt,
        storage: m.storage,
        storageKey: m.storageKey,
        resourceType: m.resourceType,
        uploadedBy: m.uploadedBy,
        gallerySectionId: m.gallerySectionId,
      }))
    );
  } catch (err) {
    console.error("[media] list failed:", err.message);
    res.status(502).json({ message: `Could not list media: ${err.message}` });
  }
});

/** Upload a file: store it, then record the ACTUAL provider values in MongoDB. */
router.post("/upload", async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const isVideo = /^video\//.test(req.file.mimetype);
    const upload = await processUpload(req.file, isVideo ? "golz/videos" : "golz/media");
    let media;
    try {
      media = await ensureMediaRecord({ file: req.file, upload, user: req.user });
    } catch (err) {
      // DB save failed after a successful storage upload — remove the orphaned asset.
      await removeStoredFile({
        storage: upload.storage || "blob",
        storageKey: upload.pathname || upload.publicId || "",
        resourceType: isVideo ? "video" : "image",
      });
      throw err;
    }
    await ActivityLog.create({ user: req.user.name, action: "Media upload", details: `Uploaded ${req.file.originalname}` });
    res.status(201).json({ _id: media._id, url: getMediaUrl(media), name: media.filename, storage: media.storage });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/** Rename a file and update its record plus every reference across collections. */
router.put("/rename", async (req, res) => {
  try {
    const { _id, name, newName, url } = req.body;
    if (!newName) return res.status(400).json({ message: "A new file name is required" });
    if (!/^[\w.-]+$/.test(newName)) return res.status(400).json({ message: "Invalid file name" });
    if (_id && !validId(_id)) return res.status(400).json({ message: "Invalid media ID" });

    let media = _id ? await Media.findById(_id) : null;
    if (!media && url) media = await Media.findOne({ url });
    if (!media) return res.status(404).json({ message: "File not found" });

    const fromUrl = String(media.url || url || "").split("?")[0];
    let toUrl, toStorageKey;

    if (isBlobConfigured()) {
      if (!isStoredUrl(fromUrl)) return res.status(400).json({ message: "Only files in the media library can be renamed" });
      if (!(await blobExists(fromUrl))) return res.status(404).json({ message: "File not found" });
      const { url: copied, pathname } = await copy(fromUrl, `${BLOB_PREFIX}/media/${newName}`, { access: "public" });
      toUrl = copied;
      toStorageKey = pathname;
      await (await import("@vercel/blob")).del(fromUrl);
    } else {
      const from = path.join(UPLOAD_DIR, path.basename(fromUrl));
      const to = path.join(UPLOAD_DIR, path.basename(newName));
      if (!fs.existsSync(from)) return res.status(404).json({ message: "File not found" });
      if (fs.existsSync(to)) return res.status(400).json({ message: "A file with that name already exists" });
      fs.renameSync(from, to);
      toUrl = `/uploads/${path.basename(newName)}`;
      toStorageKey = "";
    }

    media.filename = newName;
    media.url = toUrl;
    if (toStorageKey) media.storageKey = toStorageKey;
    if (media.thumb === fromUrl) media.thumb = toUrl;
    await media.save();

    for (const Model of MODELS) {
      const items = await Model.find({ $or: [{ url: fromUrl }, { thumb: fromUrl }, { cover: fromUrl }] });
      for (const item of items) {
        if (item.url === fromUrl) item.url = toUrl;
        if (item.thumb === fromUrl) item.thumb = toUrl;
        if (item.cover === fromUrl) item.cover = toUrl;
        await item.save();
      }
    }
    await ActivityLog.create({ user: req.user.name, action: "Media renamed", details: `${media.filename} -> ${newName}` });
    res.json({ ok: true, url: toUrl, _id: media._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/** Single delete — one ID, one record, one stored asset. Never affects other records. */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!validId(id)) return res.status(400).json({ message: "Invalid media ID" });
    const media = await Media.findById(id);
    if (!media) return res.status(404).json({ message: "Media not found" });
    await removeStoredFile(media);
    await Media.deleteOne({ _id: media._id });
    await ActivityLog.create({ user: req.user.name, action: "Media deleted", details: `Deleted ${media.filename}` });
    res.json({ ok: true, deleted: 1 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/** Bulk delete — requires an explicit non-empty array of IDs. */
router.delete("/", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ message: "No media selected" });
    if (ids.some((id) => !validId(id))) return res.status(400).json({ message: "One or more media IDs are invalid" });
    const records = await Media.find({ _id: { $in: ids } });
    for (const media of records) await removeStoredFile(media);
    await Media.deleteMany({ _id: { $in: ids } });
    await ActivityLog.create({ user: req.user.name, action: "Media bulk deleted", details: `Deleted ${records.length} files` });
    res.json({ ok: true, deleted: records.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
