import "dotenv/config";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import http from "http";
import express, { Router } from "express";
import { connectDb } from "./config/db.js";
import router from "./router/auth.router.js";
import cors from "cors";
import messageModel from "./models/message.model.js";
const server = http.createServer();
const onlineUser = new Map();
async function main() {
  const app = express();

  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    }),
  );
  app.use(cookieParser());
  app.use(express.json());
  app.use("/auth", router);
  const server = http.createServer(app);
  const io = new Server({
    cors: {
      origin: "http://localhost:5173",
    },
  });
  io.attach(server);

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // socket.userId = decoded.id;
    next();
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    onlineUser.set(userId, socket.id);
    console.log("client connected", socket.id);
    socket.on("disconnect", () => {
      onlineUser.delete(socket.userId);
      console.log("Client is disconnected", socket.id);
    });
    socket.on("send-message", async ({ receiverId, text }) => {
      //getting receiver scoket id
      const message = await messageModel.create({
        senderId: socket.userId,
        receiverId,
        text,
      });

      const receiverSocketID = onlineUser.get(receiverId);
      io.to(receiverSocketID).emit("receiver-message", {
        text,
        senderId: socket.userId,
      });
    });
    socket.emit("welcome", "Welcome Rishi");
  });
  await connectDb();
  server.listen(3000, () => {
    console.log("Server is listenong on 3000");
  });
}

main();
