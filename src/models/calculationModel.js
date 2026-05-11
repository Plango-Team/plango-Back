const mongoose = require("mongoose");

const calculationSchema = new mongoose.Schema({
  AppointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
    required: [true, "appointment id is required"],
  },
  ETT: {
    type: Number,
    require: [true, "task should have ETT"],
  },
  SDT: {
    type: Date,
    require: [true, "task should have SDT"],
  },
  weatherCondition: {
    type: String,
    require: [true, "task should have weather"],
  },
  weatherDelay: {
    type: Number,
  },
  CreatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Calculation = mongoose.model("Calculation", calculationSchema);
module.exports = Calculation;
