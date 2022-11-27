import mongoose from "mongoose";

import { app } from "./app";

// Global uncaught exception
process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("Uncaught exception, shutting down...");
  process.exit(1);
});

// Database connection
const mongodbUser = process.env.MONGODB_USER;
const mongodbPass = process.env.MONGODB_PASS;
const mongodbDataBase = process.env.MONGODB_DATABASE;

if (
  typeof mongodbUser === "string" &&
  typeof mongodbPass === "string" &&
  typeof mongodbDataBase === "string"
) {
  const dbConn = mongodbDataBase.replace("<password>", mongodbPass);

  // Development logging
  if (process.env.NODE_ENV === "development") {
    // console.log(process.env);
    mongoose.set("debug", true);
  }

  mongoose.connect(dbConn, (err) => {
    if (err) {
      console.log(err);
    }
  });

  console.log("DB connection sucessful!");
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
