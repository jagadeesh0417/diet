import jwt from "jsonwebtoken";
import User from "../models/User.js";

const SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

export function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.golz_token;
    if (!token) return res.status(401).json({ message: "Not authenticated" });
    const payload = verifyToken(token);
    const user = await User.findById(payload.id);
    if (!user || !user.active) return res.status(401).json({ message: "Account inactive or removed" });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Session expired, please sign in again" });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") return res.status(403).json({ message: "Admin access required" });
  next();
}
