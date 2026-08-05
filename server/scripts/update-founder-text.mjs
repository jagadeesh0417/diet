import "dotenv/config";
import mongoose from "mongoose";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backupPath = path.join(__dirname, "..", "homepage-backup.json");

await mongoose.connect(process.env.MONGO_DIRECT_URI || process.env.MONGO_URI);

const Setting = mongoose.models.Setting || mongoose.model("Setting", new mongoose.Schema({ key: String, value: mongoose.Schema.Types.Mixed }, { collection: "settings" }));

const doc = await Setting.findOne({ key: "homepage" });
if (!doc) { console.error("homepage setting not found"); process.exit(1); }

fs.writeFileSync(backupPath, JSON.stringify(doc.value, null, 2));
console.log("backup written to", backupPath);

const text = doc.value?.aboutPreview?.text || "";
const paras = text.split(/\n{2,}/);
console.log("paragraph count:", paras.length);
if (paras.length >= 5) {
  const before = paras[4];
  const updated = before.replace(/reversing diabetes,/, "reversing diabetes, weight management,");
  console.log("changed:", updated !== before);
  if (updated !== before) {
    paras[4] = updated;
    doc.value.aboutPreview.text = paras.join("\n\n");
    await Setting.updateOne({ key: "homepage" }, { $set: { value: doc.value } });
    console.log("saved to Atlas");
  } else {
    console.log("NO CHANGE - pattern not found");
  }
} else {
  console.log("fewer than 5 paragraphs - nothing to do");
}

await mongoose.disconnect();
process.exit(0);
