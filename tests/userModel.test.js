"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userModel_1 = require("../src/models/userModel");
const mongodb_memory_server_1 = require("mongodb-memory-server");
const testDataImportDelete_1 = require("./utils/testDataImportDelete");
let mongoServer;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    mongoServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
    yield mongoose_1.default.connect(mongoServer.getUri());
    // mongoose.set("debug", true);
}));
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, testDataImportDelete_1.importData)();
    yield userModel_1.User.find({});
}));
afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, testDataImportDelete_1.deleteData)();
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.disconnect();
    yield mongoServer.stop();
}));
describe("User Model Test", () => {
    it("create & save user successfully", () => __awaiter(void 0, void 0, void 0, function* () {
        const userData = {
            name: "George Gale",
            email: "gmgale@ocloud.com",
            password: "testPassword",
            passwordConfirm: "testPassword",
        };
        const validUser = new userModel_1.User(userData);
        const savedUser = yield validUser.save();
        // Object Id should be defined when successfully saved to MongoDB.
        expect(savedUser._id).toBeDefined();
        expect(savedUser.name).toBe(userData.name);
        expect(savedUser.email).toBe(userData.email);
        expect(yield savedUser.correctPassword(userData.password, savedUser.password)).toBeTruthy();
    }));
});
