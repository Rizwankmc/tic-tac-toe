import { io } from "socket.io-client";
import readline from "readline";

const serverPath = process.argv[2];
const regex =
  /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/;

if (regex.test(serverPath)) {
  // connect to server
  const socket = io(serverPath);

  // creating read and write variable
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // loggin message on connect to server
  socket.on("connect", () => {
    console.log("Connected to Server at port 3001");
  });

  // socket to listen for game start
  socket.on("gameStart", (data) => {
    console.log(
      `....Game Started....\n\n \tYour are player ${data.playerPosition}\n`
    );

    // display for initial matrix
    data.matrix.forEach((row) => {
      console.log("\t", row.join(" "));
    });
    console.log("\n");

    // game start with player 1
    if (data.playerPosition === 1) {
      playerAction(1);
    } else {
      // waiting mesasge for player 2
      console.log("\n-----------------------------\n");
      console.log("Opponent is taking action");
    }
  });

  // socket to log updated matrix
  socket.on("updateMatrix", (data) => {
    data.matrix.forEach((row) => {
      console.log("\t", row.join(" "));
    });
    console.log("\n");
  });

  // socket to listen player turn and player act on his turn
  socket.on("playerTurn", (data) => {
    playerAction(data.playerPosition);
  });

  // socket to get mesasge that opponent is taking action
  socket.on("waiting", () => {
    console.log("Opponent is taking action");
  });

  // socket to listen  wrong choice
  socket.on("notValid", (data) => {
    console.log("Not a valid position!");
    playerAction(data.playerPosition);
  });

  // socket to listen game winner and terminate connection
  socket.on("winner", (data) => {
    console.log("Winner is Player", data.winnner);
    socket.disconnect();
    process.exit();
  });

  // socket to listen finish trigger when one of the player press r for resign
  socket.on("finish", (data) => {
    console.log(
      `Player ${data.resignBy} resigned \n Player ${data.winner} is winner`
    );
    socket.disconnect();
    process.exit();
  });

  // socket to log game result as tie
  socket.on("gametie", () => {
    console.log(`Game is tied`);
    socket.disconnect();
    process.exit();
  });

  // socket to log disconnection form server
  socket.on("disconnect", () => {
    console.log("Disconnected from Server");
  });

  // function to take player input and emit player act socket
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

  // keypress listener for player resign
  process.stdin.on("keypress", (chunk, key) => {
    if (key && key.name == "r") socket.emit("resign");
  });

  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) process.stdin.setRawMode(true);
} else {
  console.log("Not a correct server Url.");
  process.exit(1);
}
