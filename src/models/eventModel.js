const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "organization id is required"],
  },
  title: {
    type: String,
    required: [true, "event title is required"],
  },
  description: {
    type: String,
  },
  startTime: {
    type: Date,
    required: [true, "event start time is required"],
  },
  visibility: {
    type: String,
    required: [true, "event visibility is required"],
  },
  location: {
    type: Object,
    required: [true, "event location is required"],
  },
  preferredArrivalTime: {
    type: Date,
    required: [true, "preferred arrival time is required"],
  },
  joinedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  CreatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
