const express = require("express");

export const userRouter = express.Router();

import {
  updateMe,
  deleteMe,
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController";
import {
  signup,
  login,
  forgotPassword,
  updatePassword,
  resetPassword,
  protect,
} from "../controllers/authController";

userRouter.post("/signup", signup);
userRouter.post("/login", login);

userRouter.post("/forgotPassword", forgotPassword);
userRouter.patch("/resetPassword/:token", resetPassword);

userRouter.patch("/updateMe", protect, updateMe);
userRouter.delete("/deleteMe", protect, deleteMe);

userRouter.patch("/updateMyPassword", protect, updatePassword);

userRouter.route("/").get(getAllUsers).post(createUser);

userRouter.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);
