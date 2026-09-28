const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User", // 👉 Tells Mongoose this ID points to the 'User' collection
  },
  token: {
    type: String, // 👉 The actual random string
    required: true,
  },
  type: {
    type: String,
    enum: ["email_token", "password_token", "temp_base32"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // 👉 Automatically sets the timestamp so you don't have to
  },
  expiresAt: {
    type: Date,
    required: true,
    expires: 0, // 👉 THE MAGIC: MongoDB deletes the document when Date.now() hits this timestamp
  },
});

module.exports = mongoose.model("Token", tokenSchema);
