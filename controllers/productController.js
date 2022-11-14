"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProductStats = exports.updateProduct = exports.deleteProduct = exports.addProduct = exports.getProduct = exports.getAllProducts = exports.aliasTopProducts = void 0;
const Product = require("../models/productModel");
const APIFeatures = require("../utils/apiFeatures");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
function aliasTopProducts(req, next) {
    req.query.limit = "3";
    req.query.sory = "price";
    next();
}
exports.aliasTopProducts = aliasTopProducts;
function getAllProducts(req, res) {
    catchAsync((req, res) => __awaiter(this, void 0, void 0, function* () {
        const features = new APIFeatures(Product.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        const products = yield features.query;
        res.status(200).json({
            status: "success",
            result: products,
        });
    }));
}
exports.getAllProducts = getAllProducts;
function getProduct(req, res, next) {
    catchAsync((req, res, next) => __awaiter(this, void 0, void 0, function* () {
        const id = yield Product.findById(req.params.id, (err) => {
            if (err) {
                next(new AppError("No product found with that ID", 404));
            }
        }).clone();
        res.status(200).json({
            status: "success",
            data: id,
        });
    }));
}
exports.getProduct = getProduct;
function addProduct(req, res, next) {
    catchAsync((req, res, next) => __awaiter(this, void 0, void 0, function* () {
        const newProduct = yield Product.create(req.body, (err) => {
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
    }));
}
exports.addProduct = addProduct;
function deleteProduct(req, res, next) {
    catchAsync((req, res, next) => __awaiter(this, void 0, void 0, function* () {
        yield Product.findByIdAndDelete(req.params.id, (err) => {
            if (err) {
                next(new AppError("No product found with that ID", 404));
            }
        }).clone();
        res.status(204).json({
            status: "Deleted product",
        });
    }));
}
exports.deleteProduct = deleteProduct;
function updateProduct(req, res, next) {
    catchAsync((req, res, next) => __awaiter(this, void 0, void 0, function* () {
        const product = yield Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }, (err) => {
            if (err) {
                next(new AppError("No product found with that ID", 404));
            }
        }).clone();
        res.status(200).json({
            status: "success",
            data: {
                product: product,
            },
        });
    }));
}
exports.updateProduct = updateProduct;
function getProductStats(req, res, next) {
    catchAsync((req, res, next) => __awaiter(this, void 0, void 0, function* () {
        const stats = yield Product.aggregate([
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
    }));
}
exports.getProductStats = getProductStats;
