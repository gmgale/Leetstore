import fs from "fs";
import { Product } from "../../src/models/productModel";
import { User } from "../../src/models/userModel";

// Read JSON file
const product = JSON.parse(
  fs.readFileSync("./tests/test-data/sample-products.json", "utf-8")
);

// Import function into database
export async function importData() {
  try {
    // Product.create can accept an array, JSON parse abover converts json to this array.
    await Product.create(product);
  } catch (err) {
    console.log(err);
  }
}

// Delete all data from DB
export async function deleteData() {
  try {
    // deleteMany with 0 args will drop all.
    await Product.deleteMany();
    await User.deleteMany();
  } catch (err) {
    console.log(err);
  }
}
