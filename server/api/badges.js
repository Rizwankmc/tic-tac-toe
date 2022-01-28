import express from "express";
const router = express.Router();

import User from "../models/User.model.js";
import Profile from "../models/Profile.model.js";

import auth from "../middleware/auth.middleware.js";
import { newBadgeNotification } from "../server-utils/notifications.js";

// @route:  POST /api/badges/:userId
// @desc:   Add a badge to user's profile
router.post("/:userId", auth, async (req, res) => {
  const { title, image, description } = req.body;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    if (user.role !== "root") {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    let profile = await Profile.findOne({ user: req.params.userId });
    if (!profile) {
      return res.status(404).json({ msg: "Profile not found" });
    }

    profile.badges.push({ title, image, description });
    profile = await profile.save();

    await newBadgeNotification(req.params.userId, title);

    res.status(200).json(profile.badges);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
