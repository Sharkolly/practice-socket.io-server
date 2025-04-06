const { Schema, model } = require("mongoose");

const postSchema = new Schema({
  title: String,
  content: String,
  createdAt: { type: Date, default: Date.now },
});

const userDetails = new Schema(
  {
    email: {
      type: String,
      required: [true, "Please provide a username"],
      unique: [true, "Username already exists"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
    },
    image: {
      type: String,
      // required: [true, "Please provide a image"],
      unique: false,
    },
    post: [postSchema],
    resetCode: {
      type: String,
    },
    resetCodeExpiration: { type: Date },
  },
  { timestamps: true }
);

module.exports = model("User", userDetails);
