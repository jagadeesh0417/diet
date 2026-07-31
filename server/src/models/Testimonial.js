import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, default: "" },
    photo: { type: String, default: "" },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    text: { type: String, required: true },
    result: { type: String, default: "" },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Testimonial", schema);
