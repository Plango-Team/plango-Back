const catchAsync = require("express-async-handler");
const taskService = require("../services/task.service");
const { sendSuccess } = require("../utils/helpers");
const { t } = require("../utils/i18n");

exports.createTask = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const lang = req.lang;

  const task = await taskService.createTask({
    data: req.body,
    userId,
    lang,
  });

  sendSuccess(res, 201, t(lang, "TASK_CREATED"), { task });
});

exports.getTasks = catchAsync(async (req, res) => {
  const lang = req.lang;
  const tasks = await taskService.getTasks({
    userId: req.user._id,
    lang,
  });

  sendSuccess(res, 200, t(lang, "TASK_RETRIEVED"), {
    results: tasks.length,
    tasks,
  });
});

exports.getTask = catchAsync(async (req, res) => {
  const lang = req.lang;
  const task = await taskService.getTask({
    id: req.params.id,
    userId: req.user._id,
    lang,
  });

  sendSuccess(res, 200, t(lang, "TASK_RETRIEVED"), { task });
});

exports.updateTask = catchAsync(async (req, res) => {
  const lang = req.lang;
  const task = await taskService.updateTask({
    id: req.params.id,
    userId: req.user._id,
    data: req.body,
    lang,
  });

  sendSuccess(res, 200, t(lang, "TASK_UPDATED"), { task });
});

exports.deleteTask = catchAsync(async (req, res) => {
  const lang = req.lang;
  await taskService.deleteTask({
    id: req.params.id,
    userId: req.user._id,
    lang,
  });

  sendSuccess(res, 200, t(lang, "TASK_DELETED"), null);
});

exports.getLinkableAppointments = catchAsync(async (req, res) => {
  const lang = req.lang;
  const appointments = await taskService.getLinkableAppointments({
    userId: req.user._id,
    lang,
  });

  sendSuccess(res, 200, t(lang, "TASK_RETRIEVED"), {
    results: appointments.length,
    appointments,
  });
});
