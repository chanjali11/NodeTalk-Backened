// src/controller/messageController.js
const Message = require("../model/message.model");
const { Op } = require("sequelize");
// const User = require("../model/user.model");
exports.sendMessage = async (req, res) => {
  const { senderId, receiverId, groupId, content, type } = req.body;
  const file_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const message = await Message.create({
      senderId,
      receiverId: receiverId || null,
      groupId: groupId || null,
      content,
      file_url,
      type: file_url ? type : "text",
    });

    res.status(201).json({ message: "Message sent", data: message });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
};

exports.getPrivateMessages = async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    if (!user1 || !user2) {
      return res
        .status(400)
        .json({ message: "Both user1 and user2 are required." });
    }

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: user1, receiverId: user2 },
          { senderId: user2, receiverId: user1 },
        ],
      },
      order: [["createdAt", "ASC"]],
    });

    const formattedMessages = messages.map((msg) => ({
      message_id: msg.id,
      from: msg.senderId,
      to: msg.receiverId,
      content: msg.content,
      file_url: msg.file_url,
      type: msg.type || "text",
      timestamp: msg.createdAt,
    }));

    res.json({
      conversation_between: {
        user1_id: parseInt(user1),
        user2_id: parseInt(user2),
      },
      messages: formattedMessages,
    });
  } catch (error) {
    console.error("Error fetching private messages:", error);
    res.status(500).json({ message: " Server Error" });
  }
};

// Group chat
exports.getGroupMessages = async (req, res) => {
  const { groupId } = req.params;

  const messages = await Message.findAll({
    where: { groupId },
    order: [["createdAt", "ASC"]],
  });

  res.json(messages);
};
