const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: [true, "appointment id is required"],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "user id is required"],
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: [true, "task id is required"],
  },
  type: {
    type: String,
    required: [true, "notification type is required"],
  },
  schedualeTime: {
    type: Date,
    required: [true, "scheduale time is required"],
  },
  message: {
    type: String,
    required: [true, "notification message is required"],
  },
  sendTime: {
    type: Date,
  },
  seen: {
    type: Boolean,
    default: false,
  },
  CreatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
