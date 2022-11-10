const mongoose = require("mongoose");
const dotenv = require("dotenv");

// Global uncaught exception
process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  console.log("Uncaught exception, shutting down...");
  process.exit(1);
});

dotenv.config({ path: "./config.env" });
dotenv.config({ path: "./secrets.env" });

// Database connection
const dbConn = process.env.DATABASE.replace(
  "<USERNAME>",
  process.env.MONGODB_USER
).replace("<PASSWORD>", process.env.MONGODB_PASS);

mongoose
  .connect(dbConn, {
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("DB connection sucessful!");
  });

const app = require("./app");

const port = process.env.LOCAL_PORT || 3000;

const server = app.listen(port, () => {
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
