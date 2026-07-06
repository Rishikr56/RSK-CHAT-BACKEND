import Message from "../models/message.model.js";

async function getAllMessage(req, res) {
  try {
    const receiverId = req.params.receiverId;
    const senderId = req.user.id;
    console.log("senderId", senderId);
    console.log("receiver id in chat section is", receiverId);
    const messages = await Message.find({
      $or: [
        {
          senderId: senderId,
          receiverId: receiverId,
        },
        {
          senderId: receiverId,
          receiverId: senderId,
        },
      ],
    }).sort({ createdAt: 1 });
    console.log(messages);
    return res.status(200).json({
      success: true,
      message: messages,
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      message: "No message found",
    });
  }
}

export { getAllMessage };
