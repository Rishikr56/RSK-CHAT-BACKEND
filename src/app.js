import "dotenv/config";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import http from "http";
import express, { Router } from "express";
import { connectDb } from "./config/db.js";
import router from "./router/auth.router.js";
import chatRouter from "./router/chat.router.js";
import cors from "cors";
import Conversation from "./models/conversation.models.js";
import Message from "./models/message.model.js";
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
  app.use("/", chatRouter);
  app.use("/auth", router);
  const server = http.createServer(app);
  const io = new Server({
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });
  io.attach(server);

  io.use(async (socket, next) => {
    const connected_user_id = socket.handshake.auth?.user_id;
    console.log(connected_user_id);
    socket.userId = connected_user_id;
    next();
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    console.log("socket se connected user ki id", userId);
    onlineUser.set(userId, socket.id);

    socket.on("send-message", async (data) => {
      try {
        console.log("message received", data);
        const senderId = socket.userId;
        console.log("sender id ", senderId);
        const { receiverId, message } = data;
        console.log("receiverId", receiverId, "Messgae from sender", message);
        let conversation = await Conversation.findOne({
          participants: {
            $all: [senderId, receiverId],
          },
        });
        console.log(conversation);
        if (!conversation) {
          conversation = Conversation.create({
            participants: [senderId, receiverId],
            lastMessage: message,
          });
        }
        const newMessage = await Message.create({
          converstationId: conversation._id,
          senderId,
          text: message,
        });
        conversation.lastMessage = message;
        await conversation.save();

        const receiverSocketId = onlineUser.get(receiverId);

        console.log("receiver socket", receiverSocketId);

        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive-message", newMessage);
        }
      } catch (error) {
        console.log("error wala message", error.message);
      }
    });

    socket.on("disconnect", () => {
      onlineUser.delete(socket.userId);
      console.log("Client is disconnected", socket.id);
    });
  });

  await connectDb();
  server.listen(3000, () => {
    console.log("Server is listenong on 3000");
  });
}

main();
