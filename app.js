const express = require("express");
const morgan = require("morgan");
const userRouter = require("./src/routes/userRoutes");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSantize = require("express-mongo-sanitize");
const errorMiddleware = require("./src/middlewares/errorMiddleware");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use(morgan("dev"));
//app.use(mongoSantize()); // data sanitization

const limitter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "too many requests from the same ip try again in an hour.",
});
app.use("/api", limitter);

app.use("/api/v1/users", userRouter);

// unhandled routes
app.all("*", (req, res, next) => {
  const AppError = require("./src/utils/appError");
  next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

// global error handling middleware
app.use(errorMiddleware);

module.exports = app;
