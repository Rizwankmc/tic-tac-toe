import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    timer: {
      type: Number,
      default: 30,
    },
    matrix: [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ],
    players: [],

    status: {
      type: String,
      default: "empty",
    },
    winner: {
      type: String,
    },
    gameFinish: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("tictacRoom", roomSchema);
