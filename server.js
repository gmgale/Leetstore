"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = __importDefault(require("./app"));
// Global uncaught exception
process.on("uncaughtException", (err) => {
    console.log(err.name, err.message);
    console.log("Uncaught exception, shutting down...");
    process.exit(1);
});
dotenv_1.default.config({ path: "./config.env" });
dotenv_1.default.config({ path: "./secrets.env" });
// Database connection
const mongodbUser = process.env.MONGODB_USER;
const mongodbPass = process.env.MONGODB_PASS;
const mongodbDataBase = process.env.MONGODB_DATABASE;
if (typeof mongodbUser === "string" &&
    typeof mongodbPass === "string" &&
    typeof mongodbDataBase === "string") {
    const dbConn = mongodbDataBase
        .replace("<USERNAME>", mongodbUser)
        .replace("<PASSWORD>", mongodbPass);
    mongoose_1.default.connect(dbConn).then(() => {
        console.log("DB connection sucessful!");
    });
}
else {
    throw new Error("Error in connection settings.");
}
const port = process.env.LOCAL_PORT || 3000;
const server = app_1.default.listen(port, () => {
    console.log(`App running on port ${port}...`);
});
// Global unhandled promise rejection
process.on("unhandledRejection", (err) => {
    console.log(err.name, err.message);
    server.close(() => {
        console.log("Unhandled rejection, shutting down...");
        process.exit(1);
    });
});
