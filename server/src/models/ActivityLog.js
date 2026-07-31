import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    user: { type: String, default: "" },
    action: { type: String, required: true },
    details: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("ActivityLog", schema);
