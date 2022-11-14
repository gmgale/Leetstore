import { Router, Request, Response, NextFunction } from "express";

const router = Router();
import {
  aliasTopProducts,
  getAllProducts,
  getProductStats,
  addProduct,
  getProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController";
import { protect } from "../controllers/authController";

const dump = (req: Request, res: Response, next: NextFunction) => {
  console.log(req);
  next();
};

router.route("/top-products").get(aliasTopProducts, getAllProducts);

router.route("/product-stats").get(getProductStats);

router.route("/").get(getAllProducts).post(protect, addProduct);

router.route("/:id").get(getProduct).patch(updateProduct).delete(
  protect,
  // authController.restrictTo("admin", "manager", "lead-manager"),
  deleteProduct
);

export default router;
