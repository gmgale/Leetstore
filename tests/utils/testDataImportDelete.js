const fs = require("fs");
const Product = require("../../models/productModel");
const User = require("../../models/userModel");

// Read JSON file
const product = JSON.parse(
  fs.readFileSync("./tests/test-data/sample-products.json", "utf-8")
);

// Import function into database
exports.importData = async () => {
  try {
    // Tour.create can accept an array, JSON parse abover converts json to this array.
    await Product.create(product);
  } catch (err) {
    console.log(err);
  }
};

// Delete all data from DB
exports.deleteData = async () => {
  try {
    // deleteMany with 0 args will drop all.
    await Product.deleteMany();
    await User.deleteMany();
  } catch (err) {
    console.log(err);
  }
};
