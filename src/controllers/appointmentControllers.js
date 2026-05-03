const Appointment = require("../models/appointmentModel");
const AppError = require("../utils/appError");
const catchAsync = require("express-async-handler");

exports.getAppointments = catchAsync(async (req, res) => {
  const appointments = await Appointment.find();
  res.status(200).json({
    status: "success",
    numAppointments: appointments.length,
    data: {
      appointments,
    },
  });
});

exports.getAppointment = catchAsync(async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    return next(new AppError("No appointment found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      appointment,
    },
  });
});

exports.createAppointment = catchAsync(async (req, res) => {
  const newAppointment = await Appointment.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      appointment: newAppointment,
    },
  });
});

exports.updateAppointment = catchAsync(async (req, res, next) => {
  const appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );
  if (!appointment) {
    return next(new AppError("No appointment found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      appointment,
    },
  });
});

exports.deleteAppointment = catchAsync(async (req, res, next) => {
  const appointment = await Appointment.findByIdAndDelete(req.params.id);
  if (!appointment) {
    return next(new AppError("No appointment found with that ID", 404));
  }
  res.status(200).json({ status: "success", data: null });
});
