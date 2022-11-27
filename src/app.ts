/*  */
import express from "express";

import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
// import xssClean from "xss-clean"; TO-DO: Fix this
import hpp from "hpp";

import {AppError} from "./utils/appError";
import {globalErrorHandler} from "./controllers/errorController";
import {productRouter} from "./routes/productRoutes";
import {userRouter} from "./routes/userRoutes";

export const app = express();

// Global Middleware

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limit requests
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  message: "Too many requests from this IP, please try again in an hour.",
});
app.use("/api", limiter);

// Body parser, reading data from body into req.body with 10kb limit
app.use(
  express.json({
    limit: "10kb",
  })
);

// Data sanitization against noSQL query injection
app.use(mongoSanitize()); // Remove $ and . from body/query
// Data sanitization against XXS
// app.use(xssClean());
// Prevent HTTP parameter pollution
app.use(
  hpp({
    whitelist: ["price", "discount"],
  })
);

// Routes
app.use("/api/v1/products", productRouter);
app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on this server`, 400, res));
});

app.use(globalErrorHandler);

