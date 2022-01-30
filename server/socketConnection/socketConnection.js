import UserModel from "../models/User.model.js";
import { isWinner } from "../utils/index.js";
import jwt from "jsonwebtoken";
import { playerAction, playerResign } from "../GameLogic/tic-tac-toe.js";

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
            lastSocketData.push(checkVerify.id);
            io.users = lastSocketData;
            socket.customId = checkVerify.id;
            await UserModel.updateOne(
              {
                _id: checkVerify.id,
              },
              {
                isOnline: true,
              }
            );
            io.emit("newUser", "");
            console.log(checkVerify.id);
            const user = await UserModel.findOne({ _id: checkVerify.id });
            if (user) {
              socket.join(checkVerify.id.toString() + "notify");
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
              await User.updateOne(
                {
                  _id: socket.customId,
                },
                {
                  isOnline: false,
                }
              );
            }
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
