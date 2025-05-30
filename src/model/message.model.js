// src/model/message.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Message = sequelize.define(
  "Message",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    senderId: { type: DataTypes.INTEGER, allowNull: false },
    receiverId: { type: DataTypes.INTEGER }, // For private chats
    groupId: { type: DataTypes.INTEGER }, // For group chats
    content: { type: DataTypes.TEXT },
    file_url: { type: DataTypes.STRING }, // for image, video, doc, etc.
    type: {
      type: DataTypes.ENUM("text", "image", "video", "doc"),
      defaultValue: "text",
    },
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "messages",
    timestamps: true,
  }
);

// Message.sync({ alter: true });
module.exports = Message;
