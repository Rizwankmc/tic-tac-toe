import express from "express";
const router = express.Router();

import Profile from "../models/Profile.model.js";

router.get("/", async (req, res) => {
  try {
    const users = await Profile.countDocuments();
    res.status(200).json({ users, posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
