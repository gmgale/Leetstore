const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const hpp = require("hpp");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const productRouter = require("./routes/productRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

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
app.use(xssClean());
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
  next(new AppError(`Cant find ${req.originalUrl} on this server`));
});

app.use(globalErrorHandler);

module.exports = app;
