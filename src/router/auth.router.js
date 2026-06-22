import express from "express";
import { getMe, login, signup } from "../controllers/auth.controller.js";
import Otp from "../models/otp.module.js";
import userModels from "../models/user.models.js";
import conversationModels from "../models/conversation.models.js";
const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.get("/me", getMe);
router.post("/verify-otp", (req, res) => {
  const response = req.body;
  const user = Otp.findOne(response.email);
  const backendOtp = user.otp;
  if (response.otp === backendOtp) {
    return res.status(200).json({
      messgage: "Otp is correct",
      success: true,
    });
  } else {
    return res.status(404).json({
      messgage: "Incorrect Otp",
      success: false,
    });
  }
});

//others router

router.post("/search-mobile-no", async (req, res) => {
  try {
    const ry = req.body;
    console.log("sujit", ry);

    const user = await userModels.findOne(mobileNo);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found, You can invite them for this app",
      });
    }
    return res.status(200).json({
      success: true,
      message: "user get successfully",
      user: {
        name: user.name,
        id: user._id,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Internal server error ${error.message}`,
    });
  }
});

router.get("/get-all-related-contact", async (req, res) => {
  try {
    const getAllContacts = conversationModels.find([]);
    return res.status(200).json({
      success: true,
      message: "contacts get successfully",
      contacts: getAllContacts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Internal server error, ${error.message}`,
    });
  }
});

export default router;
