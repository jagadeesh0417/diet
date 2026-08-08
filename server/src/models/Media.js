import mongoose from "mongoose";

/**
 * Media — a database record for every uploaded file (one record per stored object).
 *
 * Storage is Vercel Blob by default; Cloudinary is used automatically when its
 * credentials are configured. The `storageKey` is the provider's own asset
 * identifier (blob pathname or Cloudinary public_id) — the reliable unique key.
 */
const mediaSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    thumb: { type: String, default: "" },
    storage: { type: String, enum: ["blob", "cloudinary", "local"], default: "blob" },
    storageKey: { type: String, trim: true },
    assetId: { type: String, trim: true },
    resourceType: { type: String, enum: ["image", "video"], required: true },
    contentType: { type: String, default: "" },
    size: { type: Number, default: 0 },
    uploadedBy: { type: String, default: "" },
    gallerySectionId: { type: String, default: "" },
  },
  { timestamps: true }
);

mediaSchema.index({ storageKey: 1 }, { unique: true, sparse: true });

export default mongoose.model("Media", mediaSchema);
