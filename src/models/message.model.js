import mongoose from "mongoose";
const messageSchema = mongoose.Schema(
  {
    converstationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);
const Message = mongoose.model("Message", messageSchema);
export default Message;
