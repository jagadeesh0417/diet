import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const User = mongoose.models.User || mongoose.model(
  "User",
  new mongoose.Schema(
    {
      name: String,
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      password: { type: String, required: true },
      role: { type: String, enum: ["admin", "editor"], default: "admin" },
      active: { type: Boolean, default: true },
    },
    { collection: "users", timestamps: true }
  )
);

await mongoose.connect(process.env.MONGO_DIRECT_URI || process.env.MONGO_URI);

const email = "nutrigolz@gmail.com";
const password = await bcrypt.hash("Admin1234", 10);
await User.updateOne(
  { email },
  { $set: { name: "Admin", email, password, role: "admin", active: true } },
  { upsert: true }
);
const u = await User.findOne({ email });
console.log("admin user ready:", u.email, "| role:", u.role, "| active:", u.active);

await mongoose.disconnect();
process.exit(0);
