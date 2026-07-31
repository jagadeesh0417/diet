import express from "express";
import Service from "../../models/Service.js";
import Blog from "../../models/Blog.js";
import GalleryItem from "../../models/GalleryItem.js";
import Testimonial from "../../models/Testimonial.js";
import ContactMessage from "../../models/ContactMessage.js";
import Appointment from "../../models/Appointment.js";
import Subscriber from "../../models/Subscriber.js";
import User from "../../models/User.js";
import Visitor from "../../models/Visitor.js";
import ActivityLog from "../../models/ActivityLog.js";
import { daysAgoKey, todayKey } from "../../utils/helpers.js";

const router = express.Router();

router.get("/", async (_req, res) => {
  const [appointments, blogs, gallery, visitors, contacts, testimonials, subscribers, users, logins] = await Promise.all([
    Appointment.countDocuments(),
    Blog.countDocuments(),
    GalleryItem.countDocuments(),
    Visitor.aggregate([{ $match: { date: todayKey() } }, { $group: { _id: null, total: { $sum: "$count" } } }]),
    ContactMessage.countDocuments(),
    Testimonial.countDocuments(),
    Subscriber.countDocuments(),
    User.countDocuments(),
    User.countDocuments({ lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 3600 * 1000) } }),
  ]);

  // 14-day visitor chart
  const raw = await Visitor.aggregate([
    { $group: { _id: "$date", total: { $sum: "$count" } } },
    { $sort: { _id: 1 } },
  ]);
  const byDay = Object.fromEntries(raw.map((r) => [r._id, r.total]));
  const visitorChart = [];
  for (let i = 13; i >= 0; i--) {
    const key = daysAgoKey(i);
    visitorChart.push({ date: key, visits: byDay[key] || 0 });
  }

  // Top pages
  const topPages = await Visitor.aggregate([
    { $group: { _id: "$path", total: { $sum: "$count" } } },
    { $sort: { total: -1 } },
    { $limit: 8 },
  ]);

  const activities = await ActivityLog.find().sort({ createdAt: -1 }).limit(15);
  const recentMessages = await ContactMessage.find().sort({ createdAt: -1 }).limit(6);
  const recentAppointments = await Appointment.find().sort({ createdAt: -1 }).limit(6);

  res.json({
    stats: {
      appointments,
      blogs,
      gallery,
      visitorsToday: visitors[0]?.total || 0,
      contacts,
      testimonials,
      subscribers,
      users,
      activeAdmins: logins,
    },
    visitorChart,
    topPages,
    activities,
    recentMessages,
    recentAppointments,
  });
});

router.get("/activities", async (_req, res) => {
  res.json(await ActivityLog.find().sort({ createdAt: -1 }).limit(100));
});

export default router;
