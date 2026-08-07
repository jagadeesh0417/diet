import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    type: { type: String, enum: ["image", "video"], default: "image" },
    url: { type: String, required: true },
    thumb: { type: String, default: "" },
    category: { type: String, default: "General" },
    caption: { type: String, default: "" },
    description: { type: String, default: "" },
    alt: { type: String, default: "" },
    order: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("GalleryItem", schema);
