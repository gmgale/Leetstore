import { User } from "../models/userModel";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/appError";
import { Request, Response, NextFunction } from "express";

const filterObj = (
  obj: Record<string, any>,
  ...allowedFields: Array<string>
) => {
  const newObj: Record<string, any> = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });

  return newObj;
};

exports.updateMe = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Create error if user POSTs password data
    if (
      req.body.hasOwnProperty("password") ||
      req.body.hasOwnProperty("passwordConfirm")
    ) {
      return next(
        new AppError(
          "This route is not for password updates, please use /updateMyPassword",
          400,
          res
        )
      );
    }
    // Update user document (not updating pass so can use update instead of save())
    const filteredBody = filterObj(req.body, "name", "email");
    const updatedUser = await User.findByIdAndUpdate(
      res.locals.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "sucesss",
      data: {
        updatedUser,
      },
    });
  }
);

exports.deleteMe = catchAsync(
  async (req: Request, res: Response, _next: NextFunction) => {
    //@ts-ignore
    await User.findByIdAndUpdate(req.user.id, {
      active: false,
      // Update this.passwordChangedAt so JWT is not valid anymore
      passwordChangedAt: Date.now(),
    });

    res.status(204).json({
      status: "success",
      data: null,
    });
  }
);

exports.getAllUsers = catchAsync(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const users = await User.find();

    res.status(200).json({
      status: "sucesss",
      data: users,
    });
  }
);
exports.getUser = (_req: Request, res: Response) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};
exports.createUser = (_req: Request, res: Response) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};
exports.updateUser = (_req: Request, res: Response) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};
exports.deleteUser = (_req: Request, res: Response) => {
  res.status(500).json({
    status: "error",
    message: "This route is not yet defined!",
  });
};
