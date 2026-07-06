import express from "express";
import { getAllMessage } from "../controllers/chat.controller.js";
import { authMiddleWare } from "../middleware/auth.middleware.js";
const router = express.Router();

router.get("/chat/get-all-message/:receiverId", authMiddleWare, getAllMessage);

export default router;
