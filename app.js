"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*  */
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const express_mongo_sanitize_1 = __importDefault(require("express-mongo-sanitize"));
// import xssClean from "xss-clean"; TO-DO: Fix this
const hpp_1 = __importDefault(require("hpp"));
const appError_1 = __importDefault(require("./utils/appError"));
const errorController_1 = __importDefault(require("./src/controllers/errorController"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const app = (0, express_1.default)();
// Global Middleware
// Set security HTTP headers
app.use((0, helmet_1.default)());
// Development logging
if (process.env.NODE_ENV === "development") {
    app.use((0, morgan_1.default)("dev"));
}
// Limit requests
const limiter = (0, express_rate_limit_1.default)({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: "Too many requests from this IP, please try again in an hour.",
});
app.use("/api", limiter);
// Body parser, reading data from body into req.body with 10kb limit
app.use(express_1.default.json({
    limit: "10kb",
}));
// Data sanitization against noSQL query injection
app.use((0, express_mongo_sanitize_1.default)()); // Remove $ and . from body/query
// Data sanitization against XXS
// app.use(xssClean());
// Prevent HTTP parameter pollution
app.use((0, hpp_1.default)({
    whitelist: ["price", "discount"],
}));
// Routes
app.use("/api/v1/products", productRoutes_1.default);
app.use("/api/v1/users", userRoutes_1.default);
app.all("*", (req, res, next) => {
    next(new appError_1.default(`Cant find ${req.originalUrl} on this server`, 400, res));
});
app.use(errorController_1.default);
exports.default = app;
