import UserModel from "../models/User.model.js";
import { isWinner } from "../utils/index.js";
import jwt from "jsonwebtoken";
import {
  playerAction,
  playerResign,
  createGame,
} from "../GameLogic/tic-tac-toe.js";

const secret = process.env.JWT_SECRET;
const socketConnection = (io) => {
  io.users = [];
  io.count = 0;
  try {
    io.on("connect", async (socket) => {
      try {
        io.count++;
        console.log(io.count, " user connected===>", socket.id);
        let token = socket.request._query["token"];
        if (token !== "undefined") {
          const checkVerify = jwt.verify(token, secret);
          if (checkVerify) {
            //socket.id = checkVeify.userid;
            let lastSocketData = io.users;
            lastSocketData.push(checkVerify.userId);
            io.users = lastSocketData;
            socket.customId = checkVerify.userId;
            await UserModel.updateOne(
              {
                _id: checkVerify.userId,
              },
              {
                isOnline: true,
              }
            );
            io.emit("newUser", "");
            console.log("userId =>", checkVerify.userId);
            const user = await UserModel.findOne({ _id: checkVerify.userId });
            if (user) {
              socket.join(checkVerify.userId.toString());
            }
          }
        }
      } catch (e) {
        console.log("error in connect block", e.message);
      }

      socket.on("playerActed", async (data) => {
        await playerAction(io, socket, data);
      });

      // soccket to listen player resign
      socket.on("resign", async (data) => {
        await playerResign(io, socket, data);
      });

      // challenge player
      socket.on("challenge", async (data) => {
        const { challengeTo, challengeBy } = data;
        console.log("challenge emit", data);
        io.in(challengeTo._id).emit("newChallenge", {
          challengeBy,
          challengeTo,
        });
      });

      socket.on("challengeAccept", async (data) => {
        io.in(data.challengeBy._id).emit("challengeAccepted");
        await createGame(io, socket, data);
      });

      socket.on("challengeReject", (data) => {
        console.log("challenge rejected", data);
        const { challengeBy, challengeTo } = data;
        io.in(challengeBy._id).emit("challengeRejected", {
          msg: "rejected",
          challengeBy,
          challengeTo,
        });
      });

      // socket to player disconnect
      socket.on("disconnect", async () => {
        try {
          console.log("disconnected", socket.id);
          io.count--;
          //code for ofline the user when disconnected
          const lastSockets = io.users;
          let filteredSockets = lastSockets.filter(
            (el) => el === socket.customId
          );
          if (filteredSockets.length > 0) {
            let index = lastSockets.indexOf(socket.customId);
            if (index !== -1) lastSockets.splice(index, 1);
            io.users = lastSockets;
            if (filteredSockets.length === 1) {
              const updateUser = await User.updateOne(
                {
                  _id: socket.customId,
                },
                {
                  isOnline: false,
                }
              );
            }
            console.log("Update user =>", updateUser);
            socket.customId = null;
            io.emit("newUser", "");
          }
        } catch (e) {
          console.log("error in disconnect block");
        }
        console.log("Player gone!");
      });
    });
  } catch (error) {
    console.log("Error in socket connection =>", error.message);
    process.exit(1);
  }
};

export default socketConnection;
