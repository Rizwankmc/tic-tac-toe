import express from "express";
const router = express.Router();

import Profile from "../models/Profile.model.js";
import Follower from "../models/Follower.model.js";

import auth from "../middleware/auth.middleware.js";

// @route   GET api/recommendations
// @desc    Get recommendations
router.get("/", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.userId });

    // Get users having most number of followers
    let popularUsers = await Follower.aggregate([
      {
        $project: {
          user: 1,
          followers: 1,
          following: 1,
          length: { $size: "$followers" },
        },
      },
      { $sort: { length: -1 } },
      { $limit: 5 },
    ]);

    // Populare aggregated users
    popularUsers = await Follower.populate(popularUsers, {
      path: "user",
      select: ["name", "profilePicUrl", "username"],
    });

    // Developers having matching tech stack
    let similarUsers = await Profile.aggregate([
      { $match: { techStack: { $in: profile.techStack } } },
      { $unwind: "$techStack" },
      { $match: { techStack: { $in: profile.techStack } } },
      { $group: { _id: "$_id" } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    similarUsers = similarUsers.map((user) => user._id);

    similarUsers = await Profile.find({ _id: { $in: similarUsers } }).populate(
      "user",
      ["name", "profilePicUrl", "username"]
    );

    res.status(200).json({ popular: popularUsers, similar: similarUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Server error" });
  }
});

export default router;
