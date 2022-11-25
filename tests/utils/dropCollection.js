"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dropCollection = void 0;
const mongoose = require("mongoose");
const dropCollection = (collectionName) => {
    const collection = mongoose.connection.collections[collectionName];
    collection.drop((err) => {
        if (err)
            throw new Error(err);
    });
};
exports.dropCollection = dropCollection;
