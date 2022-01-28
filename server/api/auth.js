import crypto from "crypto";
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

import User from "../models/User.model.js";

import auth from "../middleware/auth.middleware.js";
import upload from "../middleware/imageUpload.middleware.js";

import sendEmail from "../server-utils/sendEmail.js";
import resetHtml from "../emails/forgot-password.js";

// @route:  GET /api/auth
// @desc:   Get logged in user's info
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(400).json({
        msg: "Please verify your email and complete onboarding first",
      });
    }
    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route:  POST /api/auth
// @desc:   Login user
router.post("/", async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log(email, password);
    if (!email || !password) {
      return res.status(400).json({
        msg: "Email and Password are required",
      });
    }
    // Check if user is registered
    const user = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username: email.toLowerCase() }],
    }).select("+password");
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res
        .status(400)
        .json({ msg: "Please verify your email before trying to log in" });
    }

    // Check if password is correct
    const isCorrectPassword = await bcrypt.compare(password, user.password);
    if (!isCorrectPassword) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Sign JWT and return token
    jwt.sign({ userId: user._id }, process.env.JWT_SECRET, (err, token) => {
      if (err) throw err;
      res.status(200).json({ token });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route:  PUT /api/auth
// @desc:   Update user settings
router.put("/", auth, upload.single("profilePic"), async (req, res) => {
  try {
    console.log("dds");
    const { name, username } = req.body;

    // Check if username is already taken
    let user = await User.findOne({ username: username.toLowerCase() });
    if (user && user._id.toString() !== req.userId) {
      return res.status(400).json({ msg: "Username is already taken" });
    }
    const updatedUser = {};
    if (name) updatedUser.name = name;
    if (username) updatedUser.username = username;
    if (req.file && req.file.path) updatedUser.profilePicUrl = req.file.path;

    user = await User.findByIdAndUpdate(req.userId, updatedUser, { new: true });
    res.status(200).json(user);
  } catch (error) {
    console.error("Error =>", JSON.stringify(error));
    res.status(500).json({ msg: "Server error" });
  }
});

// @route:  PUT /api/auth/password
// @desc:   Update password
router.put("/password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.userId).select("+password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Check if current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: "Incorrect password" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ msg: "Password must be atleast 6 characters long" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ msg: "Password updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route:  POST /api/auth/forgot-password
// @desc:   Send password reset email
router.post("/forgot-password", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/?resetPassword=${resetToken}`;

    const html = resetHtml(resetUrl);

    try {
      await sendEmail({
        to: user.email,
        subject: "Moon-Bet - Reset Password",
        html,
      });
    } catch (err) {
      console.log(err);
      user.resetPasswordToken = undefined;
      await user.save();
      return res.status(500).json({ msg: "Error sending verification email" });
    }

    await user.save();
    res.status(200).json({ msg: "Email sent" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route:  PUT /api/auth/reset-password/:token
// @desc:   Reset password
router.put("/reset-password/:token", async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired token" });
    }

    // Set new password
    user.password = await bcrypt.hash(req.body.password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ msg: "Password reset complete" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
