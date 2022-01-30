import tictacRoomModel from "../models/tictacRoom.model";
import { isWinner } from "../utils";

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
    const { playerPosition, roomId } = data;
    const roomData = await tictacRoomModel.findOne({ _id: roomId });
    if (roomData) {
      let { matrix } = roomData;
      let isSpace = false;
      let playerType = playerPosition === 1 ? "X" : "O";
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
        io.emit("winner", { winnner: playerPosition });
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

export const playerResign = async (io, socket, data) => {
  try {
    const { roomId } = data;
    const roomData = await tictacRoomModel.findOne({ _id: roomId });
    if (roomData) {
    } else {
      socket.emit("actionError", { msg: "No Room Found" });
    }
  } catch (error) {
    console.log("Error in playerResign =>", error);
  }
};
