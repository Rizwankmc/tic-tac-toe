import express from "express";
const router = express.Router();

import Chat from "../models/Chat.model.js";
import User from "../models/User.model.js";
import auth from "../middleware/auth.middleware.js";

// @route:  GET /api/chats
// @desc:   Retreive user's chats
router.get("/", auth, async (req, res) => {
  try {
    const user = await Chat.findOne({ user: req.userId }).populate(
      "chats.messagesWith"
    );

    const chatsToSend =
      user.chats.length > 0
        ? user.chats.map((chat) => ({
            messagesWith: chat.messagesWith._id,
            name: chat.messagesWith.name,
            profilePicUrl: chat.messagesWith.profilePicUrl,
            lastMessage: chat.messages[chat.messages.length - 1].message,
            date: chat.messages[chat.messages.length - 1].date,
          }))
        : [];

    res.status(200).json(chatsToSend);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route:  GET /api/chats/user/:userId
// @desc:   Retrieve user info
router.get("/user/:userId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res
      .status(200)
      .json({ name: user.name, profilePicUrl: user.profilePicUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
