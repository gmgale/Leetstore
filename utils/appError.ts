import express from "express";

class AppError extends Error {
  statusCode: number;

  status: string;

  isOperational: boolean;

  constructor(message: string, statusCode: number, res: express.Response) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    if (res) {
      res.status(this.statusCode).json({
        status: this.message,
      });
    }
    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
