import express from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
const router = express.Router();
import User from "../models/User.model.js";

// @route:  POST /api/onboarding/:token
// @desc:   Verify email and complete onboarding
router.post("/:otp", async (req, res) => {
  const { otp } = req.params;

  try {
    // Find user with specific verification token
    const user = await User.findOne({ otp });
    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired token" });
    }

    // Set user verified to true
    user.isVerified = true;
    user.otp = undefined;
    await user.save();
    // Return JWT
    jwt.sign({ userId: user._id }, process.env.JWT_SECRET, (err, token) => {
      if (err) throw err;
      res.status(200).json({
        msg: "User verified and onboarded",
        token,
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
