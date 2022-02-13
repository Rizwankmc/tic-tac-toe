import tictacRoomModel from "../models/tictacRoom.model.js";
import UserModel from "../models/User.model.js";
import { isWinner } from "../utils/index.js";

export const gameStart = async (io, socket, data) => {
  try {
    const { roomId } = data;
    const roomData = await tictacRoomModel.findOne({ _id: roomId });
    if (roomData) {
      if (roomData.players.length === 2) {
        io.in(roomId).emit("gameStart", {
          playerPosition: userIndex + 1,
          matrix: roomData.matrix,
        });
      }
    } else {
      socket.emit("actionError", { msg: "Room not found" });
    }
  } catch (error) {
    console.log("Error in gameStart =>", error);
  }
};

export const playerAction = async (io, socket, data) => {
  try {
    const { userId, roomId, choice } = data;
    console.log("player action =>", data);
    const roomData = await tictacRoomModel.findOne({ _id: roomId });
    let currentPlayer;
    if (roomData) {
      let { matrix } = roomData;
      let isSpace = false;
      let playerType =
        roomData.players.findIndex((player) => player._id === userId) === 0
          ? "X"
          : "0";
      let winner;
      let isTie;
      // update matrix with appropiate position
      matrix.forEach((row, rowIndex) =>
        row.forEach((col, colIndex) => {
          if (col === choice) {
            matrix[rowIndex][colIndex] = playerType;
            return (isSpace = true);
          }
        })
      );

      // check winner
      if (isWinner(matrix)) {
        winner = roomData.players.find((el) => el._id === userId);
      } else {
        // check for tie
        isTie = true;
        matrix.forEach((row) =>
          row.forEach((col) => {
            if (typeof col === "number") isTie = false;
          })
        );
      }

      if (isSpace) {
        // emit socket playerTurn to switch turn and waiting message
        currentPlayer = roomData.players.find(
          (player) => player._id !== userId
        )._id;
      } else {
        // socket to emit player wrong choice if chocie is alreaddy taken
        socket.emit("notValid", { playerPosition: data.playerPosition });
      }
      console.log("currentPlayer =>", currentPlayer);
      await tictacRoomModel.updateOne(
        { _id: roomId },
        {
          matrix,
          isTie,
          currentPlayer,
          winner,
        }
      );
      const updatedRoom = await tictacRoomModel.findOne({ _id: roomId });
      // emit update matrix to both players
      io.emit("updateMatrix", updatedRoom);
    } else {
      socket.emit("actionError", { msg: "No room found" });
    }
  } catch (error) {
    console.log("Error in player Action =>", error);
  }
};

export const playerResign = async (io, socket, data) => {
  try {
    const { roomId, userId } = data;
    const roomData = await tictacRoomModel.findOne({ _id: roomId });
    if (roomData) {
      let loser = roomData.players.findIndex((el) => el.id === userId);
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
    } else {
      socket.emit("actionError", { msg: "No Room Found" });
    }
  } catch (error) {
    console.log("Error in playerResign =>", error);
  }
};

export const createGame = async (io, socket, data) => {
  try {
    const { challengeBy, challengeTo } = data;
    const user1 = await UserModel.findOne({ _id: challengeBy._id });
    const user2 = await UserModel.findOne({ _id: challengeTo._id });
    const room = await tictacRoomModel.create({
      players: [{ ...user1 }, { ...user2 }],
      name: `${user1.username} room`,
      currentPlayer: user1._id,
    });
    if (room) {
      let time = 10;
      const interval = setInterval(() => {
        if (time >= 0) {
          io.in(challengeTo._id).emit("gameTimer", { leftTime: time });
          io.in(challengeBy._id).emit("gameTimer", { leftTime: time });
          time -= 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            let gameTime = 3;
            io.in(challengeTo._id).emit("welcome", room);
            io.in(challengeBy._id).emit("welcome", room);
            const interval1 = setInterval(() => {
              if (gameTime >= 0) {
                io.in(challengeTo._id).emit("preTimer", { leftTime: time });
                io.in(challengeBy._id).emit("preTImer", { leftTime: time });
                gameTime -= 1;
              } else {
                clearInterval(interval1);
                io.in(challengeTo._id).emit("gameStart", room);
                io.in(challengeBy._id).emit("gameStart", room);
              }
            }, 1000);
          }, 1000);
        }
      }, 1000);
    } else {
      socket.emit("actionError", { msg: "Some error occured" });
    }
  } catch (error) {
    console.log("Error in playerResign =>", error);
  }
};
