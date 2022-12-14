import mongoose from "mongoose";
const validator = require("validator");
const bcrypt = require("bcryptjs");
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A User must have a name."],
    },
    email: {
      type: String,
      required: [true, "A User must have an email."],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "please provide a valid email."],
    },
    photo: String,
    role: {
      type: String,
      enum: ["user", "manager", "lead-manager", "admin"],
      default: "user",
    },
    password: {
      type: String,
      required: [true, "Please provide a valid password"],
      minlength: 8,
      // Never show on any output
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        // This only works on create and save
        validator: function (el: any) {
          // @ts-ignore
          return el === this.password;
        },
        message: "The passwords must match.",
      },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    methods: {
      correctPassword: async function (
        candidatePassword: string,
        userPassword: string
      ) {
        return await bcrypt.compare(candidatePassword, userPassword);
      },
      changedPasswordAfter: function (JWTTimestamp: number) {
        // If user never changed password, default to false
        if (this.passwordChangedAt) {
          const changedtimestamp = parseInt(
            // @ts-ignore
            this.passwordChangedAt.getTime() / 1000,
            10
          );

          // true = changed after JWT issued
          return JWTTimestamp < changedtimestamp;
        }
        return false;
      },
      createPasswordResetToken: function () {
        const resetToken = crypto.randomBytes(32).toString("hex");

        this.passwordResetToken = crypto
          .createHash("sha256")
          .update(resetToken)
          .digest("hex");

        this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        return resetToken;
      },
    },
  }
);

// @ts-ignore
userSchema.pre("/^find/", function (next) {
  // This points to current query
  // When a finf/findById etc is called, only active (non-"deleted") users will be returned
  // @ts-ignore
  this.find({ active: { $ne: false } });
  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  // Set the date slightly in the past so new JWT token is newer than this
  // @ts-ignore
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre("save", async function (next) {
  // Only run this function if password was modified
  if (!this.isModified("password")) return next();

  // Hash password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Remove passwordConfirm as we no longer need it and cant store it
  // @ts-ignore
  this.passwordConfirm = undefined;
  next();
});

export const User = mongoose.model("User", userSchema);
