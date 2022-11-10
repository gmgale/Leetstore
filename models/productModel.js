const mongoose = require("mongoose");
const slugify = require("slugify");
// const validator = require("validator");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A product must have a unique name."],
      unique: true,
      maxlength: [50, "Name must be less than 50 letters."],
      minlength: [5, "Name must be greater than 5 letters."],
      // validate: [validator.isAlpha, "Product name must be alphanumeric"],
    },
    slug: String,
    price: {
      type: Number,
      required: [true, "A product must have a price."],
      min: [0, "A price must be greater than 0."],
    },
    discount: {
      type: Number,
      required: [false, "A discount must have a price."],
      min: [0, "A discount must be greater than 0."],
      validate: {
        validator: function (val) {
          // 'this' only points to current doc on NEW document only (eg. not update)
          return val < this.price;
        },
        messsage: "Discount price must be below the original price.)",
      },
    },
    description: {
      type: String,
      trim: true,
    },
    images: [String],
    hiddenProduct: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.virtual("priceInDollars").get(function () {
  return this.price * 1.2;
});

// Pre document middleware runs before .save() and .create()
productSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// eslint-disable-next-line prefer-arrow-callback
// productSchema.post("save", function (doc, next) {
//   console.log(doc);
//   next();
// });

// Query middleware
// eslint-disable-next-line prefer-arrow-callback
productSchema.pre(/^find/, function (next) {
  // Only display non-hidden products when using find, findOne etc.
  this.find({ hiddenProduct: { $ne: true } });
  this.start = Date.now();
  next();
});

// eslint-disable-next-line prefer-arrow-callback
productSchema.post(/^find/, function (docs, next) {
  if (process.env.NODE_ENV === "development") {
    console.log(`Query took ${Date.now() - this.start} ms.`);
  }
  next();
});

// Aggregation middleware
// eslint-disable-next-line prefer-arrow-callback
productSchema.pre("aggregate", function (next) {
  // Exclude hidden products from aggregation calculations
  this.pipeline().unshift({ $match: { hiddenProduct: { $ne: true } } });
  next();
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
