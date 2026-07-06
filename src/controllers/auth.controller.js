import User from "../models/user.models.js";
import jwt from "jsonwebtoken";
import Otp from "../models/otp.module.js";
import userModels from "../models/user.models.js";
import { sendEmail } from "../utils/sendEmail.js";
import generateOtp from "../utils/GenerateOtp.js";
const generateToken = (userId, email, name) => {
  return jwt.sign({ id: userId, email: email, name }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// SIGNUP
const signup = async (req, res) => {
  try {
    const { name, email, dob, mobileNo, location } = req.body;
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
    const newOtp = generateOtp();
    const emailResponse = await sendEmail(email, newOtp);

    if (!emailResponse.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email",
        error: emailResponse.error,
      });
    }

    // Store OTP in database with 5 minute expiry
    //check is otp email aleady exist or not
    const isOtpEmailExist = await Otp.findOne({
      email,
    });

    if (isOtpEmailExist) {
      await Otp.updateOne({ email }, { otp: newOtp });
    } else {
      await Otp.create({
        email,
        otp: newOtp,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });
    }

    // Create user first, then send response
    const newUser = await userModels.create({
      name,
      email,
      dob,
      location,
      mobileNo,
    });

    //token generation
    const tokenSignUp = generateToken(newUser._id, newUser.email, name);
    const otpToken = generateToken(user._id, user.email, name);
    res.cookie("token", tokenSignUp, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie("token", otpToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 5 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "User signup successful and OTP sent successfully",
      data: {
        userId: newUser._id,
        email: newUser.email,
        otpSent: true,
      },
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
    const loginOtp = generateOtp();
    const resEmailOtp = await sendEmail(email, loginOtp);

    const token = generateToken(user._id, user.email, user.name);
    const otpToken = generateToken(user._id, user.email, user.name);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.cookie("otpToken", otpToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 5 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "User signin successful and OTP sent successfully",
      data: {
        userId: user._id,
        email: user.email,
        otpSent: true,
      },
    });
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
    const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    console.log("doce", decoded);
    req.userId = decoded.id;
    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user: {
        name: decoded.name,
        id: decoded.id,
      },
    });
  } catch (error) {
    return res.status(400).json({
      message: "Token not found",
      success: false,
    });
  }
};

export { signup, login, getMe };
