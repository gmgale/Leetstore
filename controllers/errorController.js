"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const appError_1 = __importDefault(require("../utils/appError"));
const handleJWTError = (res) => new appError_1.default("Invalid token, please log in again.", 401, res);
const handleJWTExpiredError = (res) => new appError_1.default("Your token has expired, please log in again.", 401, res);
const handleCastErrorDB = (err, res) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new appError_1.default(message, 400, res);
};
const handleDuplicateFieldsDB = (err, res) => {
    let message = "";
    if (err.errmsg) {
        const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
        message = `Duplicate field value: ${value}. Please use another value!`;
    }
    return new appError_1.default(message, 400, res);
};
const handleValidationErrorDB = (err, res) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors.join(". ")}`;
    return new appError_1.default(message, 400, res);
};
const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};
const sendErrorProd = (err, res) => {
    // Operational = trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    }
    else {
        // Programming or unknown error, do not send message to client
        // Log error, use logging libary in real world
        res.status(500).json({
            status: "Error",
            message: "Something went wrong!",
        });
    }
};
exports.default = (err, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "Error";
    if (process.env.NODE_ENV === "development") {
        sendErrorDev(err, res);
    }
    else if (process.env.NODE_ENV === "production") {
        let error = Object.assign(err);
        // Mark MongoDB errors as our own AppError/Operational
        if (error.name === "CastError")
            error = handleCastErrorDB(error, res);
        if (error.code === 11000)
            error = handleDuplicateFieldsDB(error, res);
        if (error.name === "ValidationError")
            error = handleValidationErrorDB(error, res);
        // JWT errors
        if (error.name === "JsonWebTokenError")
            error = handleJWTError(res);
        if (error.name === "TokenExpiredError")
            error = handleJWTExpiredError(res);
        sendErrorProd(error, res);
    }
    next();
};
