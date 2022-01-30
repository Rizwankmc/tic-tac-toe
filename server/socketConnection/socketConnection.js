import UserModel from "../models/User.model.js";
import { isWinner } from "../utils/index.js";
import jwt from "jsonwebtoken";

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
                online: true,
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

      socket.on("playerActed", (data) => {
        let isSpace = false;
        let playerType = data.playerPosition === 1 ? "X" : "O";
        // update matrix with appropiate position
        matrix.forEach((row, rowIndex) =>
          row.forEach((col, colIndex) => {
            if (col === data.choice) {
              matrix[rowIndex][colIndex] = playerType;
              return (isSpace = true);
            }
          })
        );
        // emit update matrix to both players
        io.emit("updateMatrix", { matrix });

        // check winner

        if (isWinner(matrix)) {
          // socket to emit winner
          io.emit("winner", { winnner: data.playerPosition });
          matrix = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9],
          ];
        } else {
          // check for tie
          let istie = true;
          matrix.forEach((row) =>
            row.forEach((col) => {
              if (typeof col === "number") istie = false;
            })
          );
          if (istie) {
            // socket to emit game tie message
            io.emit("gametie");
            matrix = [
              [1, 2, 3],
              [4, 5, 6],
              [7, 8, 9],
            ];
          }
        }
        if (isSpace) {
          // emit socket playerTurn to switch turn and waiting message
          users.forEach((user, userIndex) => {
            if (data.playerPosition - 1 === userIndex) {
              io.to(user).emit("waiting");
            } else {
              io.to(user).emit("playerTurn", {
                playerPosition: userIndex + 1,
                matrix,
              });
            }
          });
        } else {
          // socket to emit player wrong choice if chocie is alreaddy taken
          socket.emit("notValid", { playerPosition: data.playerPosition });
        }
      });

      // soccket to listen player resign
      socket.on("resign", () => {
        let loser = users.findIndex((el) => el === socket.id);
        let winner;
        if (loser === 0) {
          winner = 2;
        } else winner = 1;
        io.emit("finish", { resignBy: loser + 1, winner });
        matrix = [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
        ];
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
                  online: false,
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
