import User from "../models/user.models.js";
import jwt from "jsonwebtoken";
import Otp from "../models/otp.module.js";
import userModels from "../models/user.models.js";
import { sendEmail } from "../utils/sendEmail.js";
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// SIGNUP
const signup = async (req, res) => {
  try {
    const { name, email, dob, mobileNo, location } = req.body;
    console.log(name);
    if (!name || !email || !dob || !mobileNo) {
      return res.status(400).json({
        success: false,
        message: "name, email, dob and mobileNo are required",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { mobileNo }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // Send email and get OTP
    const emailResponse = await sendEmail(email);
    const token = generateToken(existingUser._id);
    // res.cookie("token", token, {
    //   httpOnly: true,
    //   sameSite: "lax",
    // });

    localStorage.setItem("token", token);
    if (!emailResponse.success) {
      localStorage.setItem("email", email);
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email",
        error: emailResponse.error,
      });
    }

    // Store OTP in database with 5 minute expiry
    await Otp.create({
      email,
      otp: emailResponse.otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email } = req.body;
    console.log("email", email);
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await userModels.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const resEmailOtp = await sendEmail(email);

    const token = generateToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    if (resEmailOtp.success) {
      return res.status(200).json({
        success: true,
        message: "OTP sent successfully",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET ME
const getMe = async (req, res, next) => {
  try {
    //isme hum only check karte hai ki user verified hai ya nahi ---- isme hum cookies se data get karte hai kyuni ccokies me token hoti hai to use get karke verify karte hai
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
    });
  } catch (error) {
    return res.status(400).json({
      message: "Token not found",
      success: false,
    });
  }
};

export { signup, login, getMe };
