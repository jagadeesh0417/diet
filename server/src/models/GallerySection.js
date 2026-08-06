import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    cover: { type: String, default: "" },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("GallerySection", schema);
