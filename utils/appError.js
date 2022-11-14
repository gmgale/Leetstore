"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AppError extends Error {
    constructor(message, statusCode, res) {
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
exports.default = AppError;
