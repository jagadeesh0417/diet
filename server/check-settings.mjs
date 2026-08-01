import "dotenv/config";
import mongoose from "mongoose";
await mongoose.connect(process.env.MONGO_DIRECT_URI, { serverSelectionTimeoutMS: 8000 });
const s = await mongoose.connection.db.collection("settings").findOne({ key: "homepage" });
console.log("keys:", Object.keys(s.value).join(", "));
console.log("heroBadge:", s.value.heroBadge, "| heroTitle:", s.value.heroTitle?.slice(0, 70));
console.log("ctaPrimary:", JSON.stringify(s.value.ctaPrimary), "| ctaSecondary:", JSON.stringify(s.value.ctaSecondary));
console.log("stats:", JSON.stringify(s.value.stats));
await mongoose.disconnect();
