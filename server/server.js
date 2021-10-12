import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";
import socketConnection from "./socketConnection/socketConnection.js";

const app = express();
app.use(cors());

const port = process.env.PORT || 3001;

// initiating the instance of server
const httpServer = createServer(app);
const io = new Server(httpServer, {});

app.get("/", (req, res) => {
  res.send(`
    <h1>Rizwan Tic tac toe Server</h1><br /><p>Server is running</p>
  `);
});

// socket function to deduct user connection to the user
socketConnection(io);
httpServer.listen(port, () => {
  console.log(`Server is Running at port ${port}`);
});
