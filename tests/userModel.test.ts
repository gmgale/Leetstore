import mongoose from "mongoose";
import { User } from "../src/models/userModel";
const dropCollection = require("./utils/dropCollection");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });
const mongoUri = process.env.localMongoUri;
if (typeof mongoUri !== "string") {
  throw new Error("MongoUriError");
}
beforeAll(() => {
  mongoose.connect(mongoUri, (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  });
  // mongoose.set("debug", true);
});

afterEach(async () => {
  await dropCollection("users");
});

describe("User Model Test", () => {
  it("create & save user successfully", async () => {
    const userData = {
      name: "George Gale",
      email: "gmgale@ocloud.com",
      password: "testPassword",
      passwordConfirm: "testPassword",
    };

    const validUser = new User(userData);
    const savedUser = await validUser.save();
    // Object Id should be defined when successfully saved to MongoDB.
    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe(userData.name);
    expect(savedUser.email).toBe(userData.email);
    expect(
      await savedUser.correctPassword(userData.password, savedUser.password)
    ).toBeTruthy();
  });
});
