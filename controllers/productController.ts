const Product = require("../models/productModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

import { Request, Response, NextFunction } from "express";

export function aliasTopProducts(req: Request, next: NextFunction) {
  req.query.limit = "3";
  req.query.sory = "price";
  next();
}

export function getAllProducts(req: Request, res: Response): void {
  catchAsync(async (req, res) => {
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
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = await Product.findById(req.params.id, (err: Error) => {
      if (err) {
        next(new AppError("No product found with that ID", 404));
      }
    }).clone();

    res.status(200).json({
      status: "success",
      data: id,
    });
  });
}

export function addProduct(req: Request, res: Response, next: NextFunction) {
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const newProduct = await Product.create(req.body, (err: Error) => {
      if (err) {
        console.log("There is an error: ", err);
        next(new AppError("No product found with that ID", 404));
      }
    });

    getAllProducts(req, res, next);

    res.status(201).json({
      status: "success",
      data: {
        product: newProduct,
      },
    });
  });
}

export function deleteProduct(req: Request, res: Response, next: NextFunction) {
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    await Product.findByIdAndDelete(req.params.id, (err: Error) => {
      if (err) {
        next(new AppError("No product found with that ID", 404));
      }
    }).clone();

    res.status(204).json({
      status: "Deleted product",
    });
  });
}

export function updateProduct(req: Request, res: Response, next: NextFunction) {
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
      (err: Error) => {
        if (err) {
          next(new AppError("No product found with that ID", 404));
        }
      }
    ).clone();

    res.status(200).json({
      status: "success",
      data: {
        product: product,
      },
    });
  });
}

export function getProductStats(
  req: Request,
  res: Response,
  next: NextFunction
) {
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
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
