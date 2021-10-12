import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";
import socketConnection from "./socketConnection/socketConnection.js";

const app = express();
app.use(cors());

// initiating the instance of server
const httpServer = createServer(app);
const io = new Server(httpServer, {});

// socket function to deduct user connection to the user
socketConnection(io);
httpServer.listen(3001, () => {
  console.log("Server is Running at port 3001");
});
