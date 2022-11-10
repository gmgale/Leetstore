const mongoose = require("mongoose");
const userModel = require("../models/userModel");
const dropCollection = require("./utils/dropCollection");

describe("User Model Test", () => {
  beforeAll(() => {
    mongoose.connect(global.__MONGO_URI__, (err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
    });
  });

  afterEach(async () => {
    await dropCollection("users");
  });

  it("create & save user successfully", async () => {
    const userData = {
      name: "George Gale",
      email: "gmgale@ocloud.com",
      password: "testPassword",
      passwordConfirm: "testPassword",
    };

    const validUser = new userModel(userData);
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
