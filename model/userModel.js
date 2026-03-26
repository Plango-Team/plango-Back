const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "user name is required"],
    unique: true,
  },
  email: {
    type: String,
    required: [true, "email is required"],
    unique: true,
  },
  phone: {
    type: String,
    required: [true, "phone number is required"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "password is required"],
  },
  resetToken: {
    type: String,
  },
  resetTokenExpire: {
    type: Date,
    default: Date.now,
  },
  avatar: {
    type: String,
    default: "../public/profile.png",
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  creatDate: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
