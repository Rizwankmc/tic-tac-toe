import express from "express";
const router = express.Router();

import User from "../models/User.model.js";
import auth from "../middleware/auth.middleware.js";

// @route:  GET /api/search/:searchText
// @desc:   Get users related to search text
router.get("/:searchText", async (req, res) => {
  const { searchText } = req.params;
  if (searchText.trim().length === 0) {
    return res.status(400).json({ msg: "Search text too short" });
  }

  try {
    const users = await User.find({
      $or: [
        { name: { $regex: searchText, $options: "i" } },
        { username: { $regex: searchText, $options: "i" } },
      ],
      isVerified: true,
    }).limit(3);

    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route:  GET /api/search/users/:searchText
// @desc:   Get users related to search text
router.get("/users/:searchText", auth, async (req, res) => {
  const { searchText } = req.params;
  if (searchText.trim().length === 0) {
    return res.status(400).json({ msg: "Search text too short" });
  }

  try {
    let users = await User.find({
      $or: [
        { name: { $regex: searchText, $options: "i" }, isVerified: true },
        { username: { $regex: searchText, $options: "i" } },
      ],
      isVerified: true,
    });

    users = users.filter((user) => user._id.toString() !== req.userId);

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route:  GET /api/search/advanced/users/:searchText
// @desc:   Get users related to search text
router.get("/advanced/users/:searchText", async (req, res) => {
  try {
    const { searchText } = req.params;

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await User.countDocuments({
      $or: [
        { name: { $regex: searchText, $options: "i" } },
        { username: { $regex: searchText, $options: "i" } },
      ],
      isVerified: true,
    });

    const users = await User.find({
      $or: [
        { name: { $regex: searchText, $options: "i" } },
        { username: { $regex: searchText, $options: "i" } },
      ],
      isVerified: true,
    })
      .skip(startIndex)
      .limit(limit);

    let next = null;
    if (endIndex < total) {
      next = page + 1;
    }

    res.status(200).json({ users, next, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
