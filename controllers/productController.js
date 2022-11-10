const Product = require("../models/productModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.aliasTopProducts = (req, res, next) => {
  req.query.limit = 3;
  req.query.sory = "price";
  next();
};

exports.getAllProducts = catchAsync(async (req, res, next) => {
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

exports.getProduct = catchAsync(async (req, res, next) => {
  const id = await Product.findById(req.params.id, (err) => {
    if (err) {
      next(new AppError("No product found with that ID", 404));
    }
  }).clone();

  res.status(200).json({
    status: "success",
    data: id,
  });
});

exports.addProduct = catchAsync(async (req, res, next) => {
  const newProduct = await Product.create(req.body, (err) => {
    if (err) {
      console.log("There is an error: ", err);
      next(new AppError("No product found with that ID", 404));
    }
  });

  this.getAllProducts(req, res, next);

  res.status(201).json({
    status: "success",
    data: {
      product: newProduct,
    },
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  await Product.findByIdAndDelete(req.params.id, (err) => {
    if (err) {
      next(new AppError("No product found with that ID", 404));
    }
  }).clone();

  res.status(204).json({
    status: "Deleted product",
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
    (err) => {
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

exports.getProductStats = catchAsync(async (req, res, next) => {
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
