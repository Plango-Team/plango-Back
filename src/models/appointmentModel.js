const mongoose = require("mongoose");
const locationSchema = require("./locationSchema");

const appointmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
      maxlength: [32, "Title cannot exceed 32 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    category: {
      type: String,
      enum: ["work", "personal", "health", "other"],
      default: "personal",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "user id is required"],
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      default: null,
    },
    transportation: {
      type: String,
      enum: ["car", "walking", "biking", "other"],
      required: [true, "transportation method is required"],
    },
    estimatedTravelTime: {
      type: Number,
      required: [true, "estimated travel time is required"],
    },
    arrivalTime: {
      type: Date,
      required: [true, "arrival time is required"],
    },
    startLocation: {
      type: locationSchema,
      required: [true, "start location is required"],
    },
    destinationLocation: {
      type: locationSchema,
      required: [true, "destination location is required"],
    },
    coordinates: {
      type: Object,
      required: [true, "coordinates are required"],
    },
    isRecurring: {
      type: Boolean,
      default: false,
    },
    repeatType: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
    },
    repeatUntil: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "canceled"],
      default: "scheduled",
    },
  },
  { timestamps: true },
);

appointmentSchema.index({ userId: 1, arrivalTime: 1 });
appointmentSchema.index({ userId: 1, status: 1 });
appointmentSchema.index({ isRecurring: 1 });

// ── Virtuals ─────────────────────────────────────────────
appointmentSchema.virtual("isPast").get(function () {
  return this.appointmentTime < new Date();
});

appointmentSchema.virtual("travelHours").get(function () {
  return +(this.estimatedTravelDuration / 60).toFixed(1);
});

// ── Validation Hooks ─────────────────────────────────────
appointmentSchema.pre("save", function (next) {
  if (this.isRecurring && !this.repeatType) {
    return next(
      new Error("Repeat type is required for recurring appointments"),
    );
  }

  if (
    this.repeatUntil &&
    this.appointmentTime &&
    this.repeatUntil < this.appointmentTime
  ) {
    return next(new Error("Repeat until date must be after appointment date"));
  }

  next();
});

const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;
