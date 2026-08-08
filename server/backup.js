import "dotenv/config";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { MONGO_DIRECT_URI } = process.env;
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const outDir = path.join(__dirname, "..", "backups", `golz-${stamp}`);
fs.mkdirSync(outDir, { recursive: true });

await mongoose.connect(MONGO_DIRECT_URI, { dbName: "golz" });
const db = mongoose.connection.db;
const collections = await db.listCollections().toArray();
let total = 0;
for (const c of collections) {
  const docs = await db.collection(c.name).find({}).toArray();
  fs.writeFileSync(path.join(outDir, `${c.name}.json`), JSON.stringify(docs, null, 2));
  total += docs.length;
  console.log(`${c.name}: ${docs.length} docs`);
}
console.log(`\nBackup complete → ${outDir} (${total} docs, ${collections.length} collections)`);
await mongoose.disconnect();
