import express from "express";
import Setting from "../../models/Setting.js";
import ActivityLog from "../../models/ActivityLog.js";
import { requireAdmin } from "../../middleware/auth.js";

const router = express.Router();

router.get("/:key", async (req, res) => {
  let doc = await Setting.findOne({ key: req.params.key });
  if (!doc) doc = { key: req.params.key, value: {} };
  res.json(doc);
});

router.put("/:key", requireAdmin, async (req, res) => {
  try {
    const doc = await Setting.findOneAndUpdate(
      { key: req.params.key },
      { $set: { value: req.body.value ?? {} } },
      { upsert: true, new: true }
    );
    await ActivityLog.create({ user: req.user.name, action: "Settings updated", details: `Updated "${req.params.key}" settings` });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
