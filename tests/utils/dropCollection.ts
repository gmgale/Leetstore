const mongoose = require("mongoose");

export const dropCollection = (collectionName: string) => {
  const collection = mongoose.connection.collections[collectionName];
  collection.drop((err: string) => {
    if (err) throw new Error(err);
  });
};
