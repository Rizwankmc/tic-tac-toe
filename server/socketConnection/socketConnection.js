import { check } from "../utils/index.js";
let users = [];
let games = [];
let matrix = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

const socketConnection = (io) => {
  try {
    io.on("connect", (socket) => {
      try {
        if (!users.find((user) => user === socket.id)) {
          users.push(socket.id);
        }
        console.log(`${users.length} users connected`);

        // check player length
        if (users.length === 2) {
          users.forEach((user, userIndex) => {
            io.to(user).emit("gameStart", {
              playerPosition: userIndex + 1,
              matrix,
            });
          });
        }
      } catch (error) {
        console.log("Error in socket connection =>", error.message);
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
        const hasWin =
          check(matrix, 0, 0, 0, 1) || // First horizontal line
          check(matrix, 1, 0, 0, 1) || // Second horizontal line
          check(matrix, 2, 0, 0, 1) || // Third horizontal line
          check(matrix, 0, 0, 1, 0) || // First vertical line
          check(matrix, 0, 1, 1, 0) || // Second vertical line
          check(matrix, 0, 2, 1, 0) || // Third vertical line
          check(matrix, 0, 0, 1, 1) || // First diagonal
          check(matrix, 0, 2, 1, -1); // Second diagonal
        if (hasWin) {
          io.emit("winner", { winnner: data.playerPosition });
        } else {
          // check for tie
          let istie = true;
          matrix.forEach((row) =>
            row.forEach((col) => {
              if (typeof col === "number") istie = false;
            })
          );
          if (istie) {
            io.emit("gametie");
          }
        }
        if (isSpace) {
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
          socket.emit("notValid", { playerPosition: data.playerPosition });
        }
      });

      socket.on("resign", () => {
        let loser = users.findIndex((el) => el === socket.id);
        let winner;
        if (loser === 0) {
          winner = 2;
        } else winner = 1;
        io.emit("finish", { resignBy: loser + 1, winner });
      });

      socket.on("disconnect", () => {
        let index = users.findIndex((user) => user === socket.id);
        if (index !== -1) {
          users.splice(index, 1);
        }
        console.log("player disconnected");
      });
    });
  } catch (error) {
    console.log("Error in socket connection =>", error.message);
    process.exit(1);
  }
};

export default socketConnection;
