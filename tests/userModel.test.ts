import mongoose from "mongoose";
import { User } from "../src/models/userModel";
import { MongoMemoryServer } from "mongodb-memory-server";
import { importData, deleteData } from "./utils/testDataImportDelete";
let mongoServer: any;
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  // mongoose.set("debug", true);
});

beforeEach(async () => {
  await importData();
  await User.find({});
});

afterEach(async () => {
  await deleteData();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
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
