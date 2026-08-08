import Media from "../models/Media.js";
import { isBlobConfigured } from "../middleware/upload.js";

/** True for a usable absolute http(s) URL. */
export function isValidUrl(url) {
  return typeof url === "string" && /^https?:\/\//i.test(url.trim()) && url.trim().length > 8;
}

/**
 * Single reliable image URL resolution.
 * 1. Prefer a valid stored `url` (the secure_url returned by the storage provider).
 * 2. Otherwise a valid thumbnail.
 * 3. Construct a Cloudinary URL only when public_id and Cloudinary configuration are valid.
 * 4. Never generate fake URLs — returns "" when no usable URL exists
 *    (callers must show the "Image unavailable" fallback instead of rendering empty sources).
 */
export function getMediaUrl(media) {
  if (!media || typeof media !== "object") return "";
  if (isValidUrl(media.url)) return media.url.trim();
  if (isValidUrl(media.thumb)) return media.thumb.trim();
  if (media.storageKey && process.env.CLOUDINARY_CLOUD_NAME) {
    const rt = media.resourceType === "video" ? "video" : "image";
    return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/${rt}/upload/${media.storageKey}`;
  }
  return "";
}

/** Best-effort removal of a stored file; never throws. */
export async function removeStoredFile(media) {
  if (!media) return;
  try {
    if (media.storage === "cloudinary") {
      if (!media.storageKey) return;
      const { default: cloudinary } = await import("cloudinary");
      await cloudinary.v2.uploader.destroy(media.storageKey, { resource_type: media.resourceType === "video" ? "video" : "image" });
      return;
    }
    if (media.storage === "blob" && media.storageKey && isBlobConfigured()) {
      const { del } = await import("@vercel/blob");
      await del(media.storageKey);
    }
  } catch (err) {
    console.error("[media] stored file cleanup failed:", err.message);
  }
}

/**
 * Creates the MongoDB Media record for a completed upload, using the ACTUAL
 * values returned by the storage provider (blob url/pathname or Cloudinary
 * secure_url/public_id/asset_id) — never guessed or constructed.
 *
 * - Deduplicates on the provider asset identifier (storageKey), not filename.
 * - If a record already exists for the same asset, the duplicate file is
 *   removed and the existing record returned.
 */
export async function ensureMediaRecord({ file, upload, user, gallerySectionId = "" }) {
  const storageKey = upload.pathname || upload.publicId || "";

  if (storageKey) {
    const existing = await Media.findOne({ storageKey });
    if (existing) {
      await removeStoredFile({
        storage: upload.storage || "blob",
        storageKey,
        resourceType: /^video\//.test(file?.mimetype || "") ? "video" : "image",
      });
      return existing;
    }
  }

  return Media.create({
    filename: file?.originalname || "",
    url: upload.url,
    thumb: upload.thumb || "",
    storage: upload.storage || "local",
    storageKey,
    assetId: upload.assetId || "",
    resourceType: /^video\//.test(file?.mimetype || "") ? "video" : "image",
    contentType: file?.mimetype || "",
    size: file?.size || 0,
    uploadedBy: user?.name || "",
    gallerySectionId,
  });
}
