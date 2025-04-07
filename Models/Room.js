// models/Room.ts
const { Schema, model } = require("mongoose");

const roomSchema = new Schema(
  {
    roomId: { type: String, unique: true, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = model("Room", roomSchema);
