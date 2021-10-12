import { io } from "socket.io-client";
import readline from "readline";

const socket = io("http://localhost:3001");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

socket.on("connect", () => {
  console.log("Connected to Server at port 3001");
});

socket.on("gameStart", (data) => {
  console.log(
    `....Game Started....\n\n \tYour are player ${data.playerPosition}\n`
  );
  data.matrix.forEach((row) => {
    console.log("\t", row.join(" "));
  });
  console.log("\n");
  if (data.playerPosition === 1) {
    playerAction(1);
  } else {
    console.log("\n-----------------------------\n");
    console.log("Opponent is taking action");
  }
});

socket.on("updateMatrix", (data) => {
  data.matrix.forEach((row) => {
    console.log("\t", row.join(" "));
  });
  console.log("\n");
});

socket.on("playerTurn", (data) => {
  playerAction(data.playerPosition);
});

socket.on("waiting", () => {
  console.log("Opponent is taking action");
});

socket.on("notValid", (data) => {
  console.log("Not a valid position!");
  playerAction(data.playerPosition);
});

socket.on("winner", (data) => {
  console.log("Winner is Player", data.winnner);
  socket.disconnect();
  process.exit();
});

socket.on("finish", (data) => {
  console.log(
    `Player ${data.resignBy} resigned \n Player ${data.winner} is winner`
  );
  socket.disconnect();
  process.exit();
});

socket.on("gametie", () => {
  console.log(`Game is tied`);
  socket.disconnect();
  process.exit();
});

socket.on("disconnect", () => {
  console.log("Disconnected from Server");
});

const playerAction = (playerPosition) => {
  try {
    console.log("\n-----------------------------\n");
    console.log("\n\tPlay or resign with 'r' \n");
    rl.question(
      `Please choose your position ${playerPosition}:`,
      (position) => {
        if (Number(position) > 0 && Number(position) < 10)
          socket.emit("playerActed", {
            playerPosition,
            choice: Number(position),
          });
        else {
          console.log("Please enter positon from 1 to 9");
        }
        console.log("\n-----------------------------\n");
      }
    );
  } catch (error) {
    console.log("Error in Input =>", error.message);
  }
};

process.stdin.on("keypress", (chunk, key) => {
  if (key && key.name == "r") socket.emit("resign");
});

readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) process.stdin.setRawMode(true);
