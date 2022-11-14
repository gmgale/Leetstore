import AppError from "../utils/appError";

import { Request, Response, NextFunction } from "express";

interface Errors {
  errmsg: string | Array<string>;
}
interface myError {
  statusCode: number;
  status: string;
  name?: string;
  path?: string;
  value?: string | number;
  errors: Errors | "";
  errmsg?: string;
  message?: string;
  stack?: string;
  isOperational?: boolean;
}

const handleJWTError = (res: Response) =>
  new AppError("Invalid token, please log in again.", 401, res);

const handleJWTExpiredError = (res: Response) =>
  new AppError("Your token has expired, please log in again.", 401, res);

const handleCastErrorDB = (err: myError, res: Response) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400, res);
};

const handleDuplicateFieldsDB = (err: myError, res: Response) => {
  let message = "";
  if (err.errmsg) {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)![0];
    message = `Duplicate field value: ${value}. Please use another value!`;
  }
  return new AppError(message, 400, res);
};
const handleValidationErrorDB = (err: myError, res: Response) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400, res);
};

const sendErrorDev = (err: myError, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: myError, res: Response) => {
  // Operational = trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or unknown error, do not send message to client
    // Log error, use logging libary in real world

    res.status(500).json({
      status: "Error",
      message: "Something went wrong!",
    });
  }
};

export default (err: myError, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "Error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = Object.assign(err);

    // Mark MongoDB errors as our own AppError/Operational
    if (error.name === "CastError") error = handleCastErrorDB(error, res);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error, res);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error, res);
    // JWT errors
    if (error.name === "JsonWebTokenError") error = handleJWTError(res);
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError(res);

    sendErrorProd(error, res);
  }
  next();
};
