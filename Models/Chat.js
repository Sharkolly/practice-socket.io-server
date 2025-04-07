// models/ChatRoom.ts
const { Schema, model } = require("mongoose");

const messageSchema = new Schema({
  senderId: String,
  senderEmail: String,
  message: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const chatRoomSchema = new Schema(
  {
    roomId: { type: String, unique: true, required: true },
    // fisrtUser: String,
    // secondUser: String,
    // propertyId: String,
    messages: [messageSchema],
  },
  { timestamps: true }
);

module.exports =  model("Chat", chatRoomSchema);
