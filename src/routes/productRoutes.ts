import { Router, Response } from "express";

export const productRouter = Router();
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

productRouter.route("/top-products").get(aliasTopProducts, getAllProducts);

productRouter.route("/product-stats").get(async (res: Response) => {
  await getProductStats(res);
});

productRouter.route("/").get(getAllProducts).post(protect, addProduct);

productRouter.route("/:id").get(getProduct).patch(updateProduct).delete(
  protect,
  // authController.restrictTo("admin", "manager", "lead-manager"),
  deleteProduct
);

