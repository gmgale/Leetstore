const request = require("supertest");
const testData = require("./utils/testDataImportDelete.js");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("../app");
const { json } = require("express");

dotenv.config({ path: "./config.env" });
dotenv.config({ path: "./secrets.env" });

beforeAll(() => {
  mongoose.connect(global.__MONGO_URI__, (err) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  });
  // mongoose.set("debug", true);
});

beforeEach(async () => {
  await testData.importData();
});

afterEach(async () => {
  await testData.deleteData();
});

describe("Product Routes", () => {
  // Get all products
  it("GET /api/v1/products/", async () => {
    const res = await request(app).get("/api/v1/products/");

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    // Check >1 product is returned
    expect(Object.keys(res.body.result).length).toBeGreaterThan(1);
  });

  // Get single product from _id
  it("GET /api/v1/products/:id", async () => {
    // Get _id of first product from all products
    let idFirstProductFromAll = 0;
    let indvidualProductfromQuery = 0;
    let res = await request(app).get("/api/v1/products/").expect(200);

    idFirstProductFromAll = res.body.result[0]._id;
    res = await request(app).get(`/api/v1/products/${idFirstProductFromAll}`);
    indvidualProductfromQuery = res.body.data;

    expect(idFirstProductFromAll).toBe(indvidualProductfromQuery._id);
  });

  it("GET /api/v1/products/:id", async () => {
    res = await request(app).get(`/api/v1/products/99999999999999`).expect(404);
  });

  // Delete product by id
  it("DELETE /api/v1/products/:id", async () => {
    // Creat user and sign in with JWT cookie
    let res1 = await request(app)
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

    res = await request(app).get("/api/v1/products/");
    expect(res.statusCode).toBe(200);
    const countBeforeDelete = Object.keys(res.body.result).length;
    const id = res.body.result[0]._id;

    res = await request(app)
      .delete(`/api/v1/products/${id}`)
      .set("cookie", [cookie.split(";")[0]])
      .expect(204);

    res = await request(app).get("/api/v1/products/");
    expect(res.statusCode).toBe(200);

    const countAfterDelete = Object.keys(res.body.result).length;
    expect(countAfterDelete + 1).toBe(countBeforeDelete);
  });

  // POST add new product with Auth
  it("POST /api/v1/products/", async () => {
    // Create user and sign in with JWT cookie
    const res1 = await request(app)
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

    const res2 = await request(app)
      .post("/api/v1/products/")
      .send(sampleProduct)
      .set("Content-Type", "application/json")
      .set("cookie", [cookie.split(";")[0]])
      .expect(201);
  });
});
