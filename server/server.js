import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import dotenv from "dotenv";
import { createServer } from "http";
import socketConnection from "./socketConnection/socketConnection.js";
import connectDB from "./server-utils/connectDB.js";
import searchRoute from "./api/search.js";
import signupRoute from "./api/signup.js";
import onBoardingRoute from "./api/onboarding.js";
import authRoute from "./api/auth.js";
import profileRoute from "./api/profile.js";
import badgeRoute from "./api/badges.js";
import recommendationRoute from "./api/recommendations.js";
import statsRoute from "./api/stats.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
connectDB();
const PORT = process.env.PORT || 3000;
// initiating the instance of server
const httpServer = createServer(app);
const io = new Server(httpServer, {});

app.get("/", (req, res) => {
  res.send(`
    <h1>Rizwan Tic tac toe Server</h1><br /><p>Server is running</p>
  `);
});

app.use("/api/search", searchRoute);
app.use("/api/signup", signupRoute);
app.use("/api/onboarding", onBoardingRoute);
app.use("/api/auth", authRoute);
app.use("/api/profile", profileRoute);
app.use("/api/badges", badgeRoute);
app.use("/api/stats", statsRoute);
app.use("/api/recommendations", recommendationRoute);

// socket function to deduct user connection to the user
socketConnection(io);
httpServer.listen(PORT, () => {
  console.log(`Server is Running at PORT ${PORT}`);
});
