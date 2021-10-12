import { isWinner } from "../utils/index.js";

// initial Setup

let users = [];
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
            // socket to emit both player that game is started
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
      socket.on("disconnect", () => {
        // remove player from users array on disconnect
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
