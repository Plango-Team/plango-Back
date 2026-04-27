// The global error handler reads these to send the right response

class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true; // marks this as a "known" error (not a bug)
  }
}

module.exports = AppError;
