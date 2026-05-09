const express = require("express");

const router = express.Router();

const taskController = require("../controllers/task.controller");

const v = require("../validators/task.validator");

const { protect, validate } = require("../middlewares");

router.use(protect);

router.post("/", v.createTask, validate, taskController.createTask);

router.get("/", taskController.getTasks);

router.get("/linkable-appointments", taskController.getLinkableAppointments);

router.get("/:id", v.taskIdValidator, validate, taskController.getTask);

router.put("/:id", v.updateTask, validate, taskController.updateTask);

router.delete("/:id", v.taskIdValidator, validate, taskController.deleteTask);

module.exports = router;
