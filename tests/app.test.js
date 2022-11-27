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
const supertest_1 = __importDefault(require("supertest"));
const testDataImportDelete_1 = require("./utils/testDataImportDelete");
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = require("../src/app");
const mongodb_memory_server_1 = require("mongodb-memory-server");
const dotenv_1 = __importDefault(require("dotenv"));
let mongoServer;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    mongoServer = yield mongodb_memory_server_1.MongoMemoryServer.create();
    yield mongoose_1.default.connect(mongoServer.getUri());
    // mongoose.set("debug", true);
    // Load JWT config, DB config is not used in tests
    dotenv_1.default.config({ path: "./config.env" });
}));
beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, testDataImportDelete_1.importData)();
}));
afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, testDataImportDelete_1.deleteData)();
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.disconnect();
    yield mongoServer.stop();
}));
describe("Product Routes", () => {
    // Get all products
    it("GET /api/v1/products/", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app_1.app).get("/api/v1/products/");
        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("success");
        // Check >1 product is returned
        expect(Object.keys(res.body.result).length).toBeGreaterThan(1);
    }));
    // Get single product from _id
    it("GET /api/v1/products/:id", () => __awaiter(void 0, void 0, void 0, function* () {
        // Get _id of first product from all products
        let idFirstProductFromAll = 0;
        let res = yield (0, supertest_1.default)(app_1.app).get("/api/v1/products/").expect(200);
        idFirstProductFromAll = res.body.result[0]._id;
        res = yield (0, supertest_1.default)(app_1.app).get(`/api/v1/products/${idFirstProductFromAll}`);
        const body = res.body;
        expect(idFirstProductFromAll).toBe(body.data._id);
    }));
    it("GET /api/v1/products/:id", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, supertest_1.default)(app_1.app).get(`/api/v1/products/99999999999999`).expect(404);
    }));
    // Delete product by id
    it("DELETE /api/v1/products/:id", () => __awaiter(void 0, void 0, void 0, function* () {
        // Creat user and sign in with JWT cookie
        let res1 = yield (0, supertest_1.default)(app_1.app)
            .post("/api/v1/users/signup/")
            .send({
            name: "Test User",
            email: "testemail@testmail.com",
            password: "password1234",
            passwordConfirm: "password1234",
        })
            .expect(201);
        const cookies = res1.headers["set-cookie"][0]
            .split(",")
            .map((item) => item.split(";")[0]);
        const cookie = cookies.join(";");
        let res = yield (0, supertest_1.default)(app_1.app).get("/api/v1/products/");
        expect(res.statusCode).toBe(200);
        const countBeforeDelete = Object.keys(res.body.result).length;
        const id = res.body.result[0]._id;
        const reqCookie = cookie.split(";")[0];
        yield (0, supertest_1.default)(app_1.app)
            .delete(`/api/v1/products/${id}`)
            .set("cookie", reqCookie)
            .expect(204);
        res = yield (0, supertest_1.default)(app_1.app).get("/api/v1/products/");
        expect(res.statusCode).toBe(200);
        const countAfterDelete = Object.keys(res.body.result).length;
        expect(countAfterDelete + 1).toBe(countBeforeDelete);
    }));
    // POST add new product with Auth
    it("POST /api/v1/products/", () => __awaiter(void 0, void 0, void 0, function* () {
        // Create user and sign in with JWT cookie
        const res1 = yield (0, supertest_1.default)(app_1.app)
            .post("/api/v1/users/signup/")
            .send({
            name: "Test User",
            email: "testemail@testmail.com",
            password: "password1234",
            passwordConfirm: "password1234",
        })
            .expect(201);
        const cookies = res1.headers["set-cookie"][0]
            .split(",")
            .map((item) => item.split(";")[0]);
        const cookie = cookies.join(";");
        const sampleProduct = {
            name: "Dog Food",
            price: "11.99",
            decription: "Yummy dog food.",
            images: ["Dog food URL goes here..."],
        };
        yield (0, supertest_1.default)(app_1.app)
            .post("/api/v1/products/")
            .send(sampleProduct)
            .set("Content-Type", "application/json")
            .set("Cookie", [cookie.split(";")[0]])
            .expect(201);
    }));
});
