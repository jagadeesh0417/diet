import multer from "multer";
import path from "path";
import fs from "fs";
import os from "os";
import { fileURLToPath } from "url";
import { put } from "@vercel/blob";
import { uploadToCloudinary, isCloudinaryConfigured } from "../config/cloudinary.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Serverless (Vercel) filesystems are read-only/ephemeral — write to /tmp instead.
export const UPLOAD_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), "uploads")
  : path.join(__dirname, "..", "..", "uploads");

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

export const BLOB_PREFIX = "golz";

export const isBlobConfigured = () => !!process.env.BLOB_READ_WRITE_TOKEN;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  const ok = /^image\/(jpeg|png|webp|gif|avif)|^video\/(mp4|webm|quicktime)/.test(file.mimetype);
  cb(ok ? null : new Error("Only images and videos are allowed"), ok);
}

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 150 * 1024 * 1024 }, // 150 MB
});

function blobName(folder, file) {
  const clean = String(folder || "misc")
    .replace(new RegExp(`^${BLOB_PREFIX}/?`), "")
    .replace(/[^a-z0-9/_-]/gi, "")
    .replace(/\/+/g, "/");
  return `${BLOB_PREFIX}/${clean}/${path.basename(file.path)}`;
}

/**
 * Processes an uploaded file — pushes to Vercel Blob (permanent, serverless-safe).
 * When blob storage is configured a failed push is a hard error: it is NEVER
 * silently stashed into ephemeral local storage, where the file would vanish
 * (broken images) while the API reports success.
 * Local/Cloudinary storage is used only when blob is not configured (local dev).
 * Returns { url, thumb, storage }.
 */
export async function processUpload(file, folder = "golz") {
  const localPath = file.path;
  const isVideo = /^video\//.test(file.mimetype);

  if (isBlobConfigured()) {
    try {
      const data = fs.readFileSync(localPath);
      const blob = await put(blobName(folder, file), data, {
        access: "public",
        contentType: file.mimetype,
      });
      fs.unlink(localPath, () => {});
      return { url: blob.url, thumb: isVideo ? "" : blob.url, storage: "blob", pathname: blob.pathname };
    } catch (err) {
      fs.unlink(localPath, () => {});
      throw new Error(`File upload failed: ${err.message}`);
    }
  }

  const cloud = await uploadToCloudinary(localPath, { folder, resourceType: isVideo ? "video" : "image" });
  if (cloud) {
    fs.unlink(localPath, () => {});
    return {
      url: cloud.url,
      thumb: cloud.thumb,
      storage: "cloudinary",
      publicId: cloud.publicId,
      assetId: cloud.assetId,
    };
  }
  const url = `/uploads/${path.basename(localPath)}`;
  return { url, thumb: isVideo ? "" : url, storage: "local" };
}
