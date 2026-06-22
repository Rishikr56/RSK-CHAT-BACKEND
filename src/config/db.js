import mongoose from "mongoose";

export const connectDb = async () => {
  try {
    const res = await mongoose.connect(process.env.MONGO_DB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.log("Error in connecting DB");
    process.exit();
  }
};
