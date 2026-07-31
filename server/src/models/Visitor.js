import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // yyyy-mm-dd
    path: { type: String, required: true },
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

schema.index({ date: 1, path: 1 }, { unique: true });

export default mongoose.model("Visitor", schema);
