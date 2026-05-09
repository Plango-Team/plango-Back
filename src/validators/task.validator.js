const { body, param } = require("express-validator");

const priorities = ["low", "medium", "high"];

const createTask = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("priority")
    .optional()
    .isIn(priorities)
    .withMessage(
      `Priority must be one of: ${priorities.join(", ")}`
    ),

  body("deadline")
    .optional()
    .isISO8601()
    .withMessage("Deadline must be valid date"),

];

const updateTask = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("priority")
    .optional()
    .isIn(priorities)
    .withMessage(
      `Priority must be one of: ${priorities.join(", ")}`
    ),

  body("deadline")
    .optional()
    .isISO8601()
    .withMessage("Deadline must be valid date"),

  body("isComplete")
    .optional()
    .isBoolean()
    .withMessage("isComplete must be boolean"),
];

const taskIdValidator = [
  param("id")
    .isMongoId()
    .withMessage("Invalid task ID format"),
];


module.exports = {
  createTask,
  updateTask,
  taskIdValidator
};