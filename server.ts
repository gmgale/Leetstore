import mongoose from "mongoose";
import dotenv from "dotenv";

import app from "./app";

// Global uncaught exception
process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("Uncaught exception, shutting down...");
  process.exit(1);
});

dotenv.config({ path: "./config.env" });
dotenv.config({ path: "./secrets.env" });

// Database connection

const mongodbUser = process.env.MONGODB_USER;
const mongodbPass = process.env.MONGODB_PASS;
const mongodbDataBase = process.env.MONGODB_DATABASE;

if (
  typeof mongodbUser === "string" &&
  typeof mongodbPass === "string" &&
  typeof mongodbDataBase === "string"
) {
  const dbConn = mongodbDataBase
    .replace("<USERNAME>", mongodbUser)
    .replace("<PASSWORD>", mongodbPass);

  mongoose.connect(dbConn).then(() => {
    console.log("DB connection sucessful!");
  });
} else {
  throw new Error("Error in connection settings.");
}

const port = process.env.LOCAL_PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Global unhandled promise rejection
process.on("unhandledRejection", (err: Error) => {
  console.log(err.name, err.message);
  server.close(() => {
    console.log("Unhandled rejection, shutting down...");
    process.exit(1);
  });
});
