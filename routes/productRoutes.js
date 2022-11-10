const express = require("express");

const router = express.Router();
const productController = require("../controllers/productController");
const authController = require("../controllers/authController");

const dump = (req, res, next) => {
  console.log(req);
  next();
};

router
  .route("/top-products")
  .get(productController.aliasTopProducts, productController.getAllProducts);

router.route("/product-stats").get(productController.getProductStats);

router
  .route("/")
  .get(productController.getAllProducts)
  .post(authController.protect, productController.addProduct);

router
  .route("/:id")
  .get(productController.getProduct)
  .patch(productController.updateProduct)
  .delete(
    authController.protect,
    // authController.restrictTo("admin", "manager", "lead-manager"),
    productController.deleteProduct
  );

module.exports = router;
