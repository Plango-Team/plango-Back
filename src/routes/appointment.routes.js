const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentControllers");
const { protect, restrictTo,validate,rateLimiters } = require("../middlewares");
const v = require("../validators/appointment.validators");
//const {general}=rateLimiters;


router.use(protect);
router.post("/", v.createAppointment,validate, appointmentController.createAppointment);
router.get("/", v.getAppointmentsValidator,validate, appointmentController.getAppointments);
router.get("/series/:id", appointmentController.getAppointmentSeries);
router.get("/:id",  appointmentController.getAppointment);
router.put("/:id",  v.updateAppointment,validate, appointmentController.updateAppointment);
router.delete("/:id", appointmentController.deleteAppointment);

module.exports = router;