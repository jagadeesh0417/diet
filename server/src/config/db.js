import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let memServer = null;

export async function connectDB() {
  const candidates = [
    process.env.MONGO_URI,
    process.env.MONGO_DIRECT_URI,
  ].filter(Boolean);

  for (const uri of candidates) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
      console.log(`[db] MongoDB connected (${uri.replace(/:\/\/[^@]*@/, "://***@")})`);
      return mongoose.connection;
    } catch (err) {
      console.warn(`[db] connect failed (${err.message}), trying next...`);
    }
  }

  if (process.env.VERCEL) {
    throw new Error("[db] No MongoDB reachable — check Atlas Network Access includes 0.0.0.0/0 for Vercel");
  }

  console.warn("[db] MongoDB unavailable, starting in-memory MongoDB (dev fallback)...");
  memServer = await MongoMemoryServer.create();
  await mongoose.connect(memServer.getUri("golz"));
  console.log(`[db] In-memory MongoDB connected (${memServer.getUri()})`);

  mongoose.connection.on("error", (e) => console.error("[db] error:", e.message));
  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memServer) await memServer.stop();
}
