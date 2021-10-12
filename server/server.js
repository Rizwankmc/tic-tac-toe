import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from "http";
import socketConnection from "./socketConnection/socketConnection.js";

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {});
socketConnection(io);
httpServer.listen(3001, () => {
  console.log("Server is Running at port 3001");
});
