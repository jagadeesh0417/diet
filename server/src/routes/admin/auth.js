import express from "express";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import User from "../../models/User.js";
import ActivityLog from "../../models/ActivityLog.js";
import { signToken, requireAuth, requireAdmin } from "../../middleware/auth.js";

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Try again in 15 minutes." },
});

router.post("/login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || "").toLowerCase().trim() });
    if (!user || !(await bcrypt.compare(String(password || ""), user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (!user.active) return res.status(403).json({ message: "Account disabled. Contact the administrator." });

    user.lastLogin = new Date();
    await user.save();
    await ActivityLog.create({ user: user.name, action: "Login", details: "Admin signed in" });

    const token = signToken(user);
    res.cookie("golz_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/me", requireAuth, (req, res) => res.json({ user: req.user }));

router.post("/logout", requireAuth, async (req, res) => {
  await ActivityLog.create({ user: req.user.name, action: "Logout", details: "Admin signed out" });
  res.clearCookie("golz_token", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  res.json({ ok: true });
});

router.put("/password", requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!(await bcrypt.compare(String(currentPassword || ""), req.user.password))) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    if (String(newPassword || "").length < 8) return res.status(400).json({ message: "New password must be at least 8 characters" });
    req.user.password = await bcrypt.hash(newPassword, 10);
    await req.user.save();
    await ActivityLog.create({ user: req.user.name, action: "Password changed", details: "Updated own password" });
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/users", requireAuth, requireAdmin, async (_req, res) => {
  res.json(await User.find().select("-password").sort({ createdAt: 1 }));
});

router.post("/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password are required" });
    const exists = await User.findOne({ email: String(email).toLowerCase() });
    if (exists) return res.status(400).json({ message: "A user with this email already exists" });
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 10), role: role || "editor" });
    await ActivityLog.create({ user: req.user.name, action: "User created", details: `Created ${user.email}` });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/users/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (req.body.name) user.name = req.body.name;
    if (req.body.role) user.role = req.body.role;
    if (typeof req.body.active === "boolean") user.active = req.body.active;
    if (req.body.password) user.password = await bcrypt.hash(req.body.password, 10);
    await user.save();
    await ActivityLog.create({ user: req.user.name, action: "User updated", details: `Updated ${user.email}` });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/users/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) return res.status(400).json({ message: "You cannot delete your own account" });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    await ActivityLog.create({ user: req.user.name, action: "User deleted", details: `Deleted ${user.email}` });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
