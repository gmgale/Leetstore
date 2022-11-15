import { APIFeatures } from "../utils/apiFeatures";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/appError";

import { Request, Response, NextFunction } from "express";
import { Product } from "../models/productModel";

export function aliasTopProducts(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  req.query.limit = "3";
  req.query.sory = "price";
  return next();
}

export function getAllProducts(req: Request, res: Response) {
  catchAsync(async () => {
    console.error(new Error());
    //@ts-ignore
    const features = new APIFeatures(Product.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const products = await features.query;

    res.status(200).json({
      status: "success",
      result: products,
    });
  });
}

export function getProduct(req: Request, res: Response, next: NextFunction) {
  catchAsync(async () => {
    try {
      const id = await Product.findById(req.params.id).clone();
      res.status(200).json({
        status: "success",
        data: id,
      });
    } catch (e) {
      next(new AppError("No product found with that ID", 404, res));
    }
  });
}

export function addProduct(req: Request, res: Response, next: NextFunction) {
  catchAsync(async () => {
    const newProduct = await Product.create(req.body, (err: Error) => {
      if (err) {
        console.log("There is an error: ", err);
        next(new AppError("No product found with that ID", 404, res));
      }
    });

    res.status(201).json({
      status: "success",
      data: {
        product: newProduct,
      },
    });
  });
}

export function deleteProduct(req: Request, res: Response, next: NextFunction) {
  catchAsync(async () => {
    await Product.findByIdAndDelete(req.params.id, (err: Error) => {
      if (err) {
        next(new AppError("No product found with that ID", 404, res));
      }
    }).clone();

    res.status(204).json({
      status: "Deleted product",
    });
  });
}

export function updateProduct(req: Request, res: Response, next: NextFunction) {
  catchAsync(async () => {
    try {
      const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      }).clone();

      res.status(200).json({
        status: "success",
        data: {
          product: product,
        },
      });
    } catch (e) {
      next(new AppError("No product found with that ID", 404, res));
    }
  });
}

export async function getProductStats(res: Response) {
  catchAsync(async () => {
    const stats = await Product.aggregate([
      {
        $match: { price: { $gte: 0 } },
      },
      {
        $group: {
          _id: null,
          numProducts: { $sum: 1 },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      data: {
        stats,
      },
    });
  });
}
