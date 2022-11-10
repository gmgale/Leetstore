const mongoose = require("mongoose");

module.exports = (collectionName) => {
  const collection = mongoose.connection.collections[collectionName];
  collection.drop((err) => {
    if (err) throw new Error(err);
  });
};
