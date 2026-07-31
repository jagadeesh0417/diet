import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    author: { type: String, default: "Admin" },
    cover: { type: String, default: "" },
    images: [{ type: String }],
    category: { type: String, default: "Nutrition" },
    tags: [{ type: String }],
    readingTime: { type: Number, default: 3 },
    published: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    scheduledAt: { type: Date, default: null },
    publishedAt: { type: Date, default: null },
    seoTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Blog", schema);
