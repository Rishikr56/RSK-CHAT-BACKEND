import express from "express";
import jwt from "jsonwebtoken";
import { getMe, login, signup } from "../controllers/auth.controller.js";
import Otp from "../models/otp.module.js";
import userModels from "../models/user.models.js";
import conversationModels from "../models/conversation.models.js";
const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.get("/me", getMe);
router.post("/verify-otp", async (req, res) => {
  try {
    const responseVerifyOtp = req.body;
    console.log(responseVerifyOtp);

    const decoded = jwt.verify(responseVerifyOtp.email, process.env.JWT_SECRET);

    const user = await Otp.findOne({ email: decoded.email });

    if (!user) {
      return res.status(200).json({
        message: "OTP not found or expired",
        success: false,
      });
    }

    const backendOtp = user.otp;
    if (responseVerifyOtp?.otp == backendOtp) {
      return res.status(200).json({
        message: "OTP is correct",
        success: true,
      });
    } else {
      return res.status(200).json({
        message: "Incorrect OTP",
        success: false,
      });
    }
  } catch (error) {
    console.error("OTP verification error:", error.message);
    return res.status(200).json({
      message: error.message,
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

router.get("/token-get", (req, res) => {
  const token = req.cookies.token;
  return res.status(200).json({
    success: true,
    token: token,
  });
});
export default router;
