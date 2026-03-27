const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "user id is required"],
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: [true, "event id is required"],
  },
  startLocation: {
    type: Object,
    required: [true, "start location is required"],
  },
  endLocation: {
    type: Object,
    required: [true, "end location is required"],
  },
  transportaion: {
    type: String,
    required: [true, "transportation method is required"],
  },
  expectedTravelTime: {
    type: Number,
    required: [true, "expected travel time is required"],
  },
  preferredArrivalTime: {
    type: Date,
    required: [true, "preferred arrival time is required"],
  },
  isFrequency: {
    type: Boolean,
    default: false,
  },
  frequency: {
    type: String,
    enum: ["daily", "weekly", "monthly"],
  },
  CreatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;
