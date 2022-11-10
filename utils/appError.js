class AppError extends Error {
  constructor(message, statusCode, res = null) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    if (res) {
      res.status(this.statusCode).JSON({
        status: this.message,
      });
    }
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
