"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const productController_1 = require("../controllers/productController");
const authController_1 = require("../controllers/authController");
const dump = (req, res, next) => {
    console.log(req);
    next();
};
router.route("/top-products").get(productController_1.aliasTopProducts, productController_1.getAllProducts);
router.route("/product-stats").get(productController_1.getProductStats);
router.route("/").get(productController_1.getAllProducts).post(authController_1.protect, productController_1.addProduct);
router.route("/:id").get(productController_1.getProduct).patch(productController_1.updateProduct).delete(authController_1.protect, 
// authController.restrictTo("admin", "manager", "lead-manager"),
productController_1.deleteProduct);
exports.default = router;
