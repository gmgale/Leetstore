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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteData = exports.importData = void 0;
const fs_1 = __importDefault(require("fs"));
const productModel_1 = require("../../src/models/productModel");
const userModel_1 = require("../../src/models/userModel");
// Read JSON file
const product = JSON.parse(fs_1.default.readFileSync("./tests/test-data/sample-products.json", "utf-8"));
// Import function into database
function importData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Product.create can accept an array, JSON parse abover converts json to this array.
            yield productModel_1.Product.create(product);
        }
        catch (err) {
            console.log(err);
        }
    });
}
exports.importData = importData;
// Delete all data from DB
function deleteData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // deleteMany with 0 args will drop all.
            yield productModel_1.Product.deleteMany();
            yield userModel_1.User.deleteMany();
        }
        catch (err) {
            console.log(err);
        }
    });
}
exports.deleteData = deleteData;
