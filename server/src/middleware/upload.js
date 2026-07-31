import multer from "multer";
import path from "path";
import fs from "fs";
import os from "os";
import { fileURLToPath } from "url";
import { uploadToCloudinary, isCloudinaryConfigured } from "../config/cloudinary.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Serverless (Vercel) filesystems are read-only/ephemeral — write to /tmp instead.
export const UPLOAD_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), "uploads")
  : path.join(__dirname, "..", "..", "uploads");

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

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

/**
 * Processes an uploaded file — pushes to Cloudinary when configured.
 * Returns { url, thumb, localPath }. Caller must handle local cleanup.
 */
export async function processUpload(file, folder = "golz") {
  const localPath = file.path;
  const cloud = await uploadToCloudinary(localPath, { folder, resourceType: file.mimetype.startsWith("video") ? "video" : "image" });
  if (cloud) {
    fs.unlink(localPath, () => {});
    return { url: cloud.url, thumb: cloud.thumb };
  }
  const isVideo = /^video\//.test(file.mimetype);
  const url = `/uploads/${path.basename(localPath)}`;
  return { url, thumb: isVideo ? "" : url };
}
