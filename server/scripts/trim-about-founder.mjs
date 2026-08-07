import "dotenv/config";
import mongoose from "mongoose";

const Setting = mongoose.models.Setting || mongoose.model(
  "Setting",
  new mongoose.Schema(
    { key: String, value: mongoose.Schema.Types.Mixed },
    { collection: "settings", timestamps: true }
  )
);

await mongoose.connect(process.env.MONGO_DIRECT_URI || process.env.MONGO_URI);

const s = await Setting.findOne({ key: "homepage" });
if (!s) throw new Error("homepage setting not found");

const text = s.value?.aboutPreview?.text || "";
const paras = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

console.log("=== BEFORE (%d paragraphs) ===", paras.length);
paras.forEach((p, i) => console.log(`[${i + 1}] ${p.slice(0, 90)}...`));

const blocked = ["She holds a Ph.D.", "Over the years, she has helped clients"];
const kept = paras.filter((p) => !blocked.some((b) => p.startsWith(b)));

console.log("=== AFTER (%d paragraphs) ===", kept.length);
kept.forEach((p, i) => console.log(`[${i + 1}] ${p.slice(0, 90)}...`));

s.value = { ...s.value, aboutPreview: { ...s.value.aboutPreview, text: kept.join("\n\n") } };
await s.save();
console.log("SAVED");

await mongoose.disconnect();
process.exit(0);
