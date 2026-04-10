const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    require: [true, "task should have title"],
  },
  description: {
    type: String,
    require: [true, "task should have discription"],
  },
  deadline: {
    type: Date,
    require: [true, "task should have Deadline date"],
  },
  isComplete: {
    type: Boolean,
    default: false,
  },
  reminderTime: {
    type: Date,
  },
  priorty: {
    type: String,
    require: [true, "task should have priorty"],
  },
  CreatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;
