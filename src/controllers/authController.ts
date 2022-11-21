// @ts-nocheck
import { promisify } from "util";
import jwt, { Secret } from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/userModel";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/appError";
import { sendEmail } from "../utils/email";
import { Request, Response, NextFunction } from "express";

const signToken = (id: String) =>
  jwt.sign(id, process.env.JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (
  user: any,
  statusCode: number,
  res: Response
): void => {
  // Log the user in, send JWT
  // @ts-ignore
  const token = signToken(user._id);

  let expire = 0;
  if (typeof process.env.JWT_COOKIE_EXPIRES_IN === "string") {
    expire = Number(process.env.JWT_COOKIE_EXPIRES_IN);
  }
  expire = expire * 24 * 60 * 60 * 1000;
  const date = new Date(expire);

  const cookieOptions = {
    expires: date,
    httpOnly: true,
    secure: false,
  };

  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true; //https
  }
  res.cookie("jwt", token, cookieOptions);

  // remove the password from the output
  user.password = undefined;

  res.status(statusCode).json({
    status: "Success",
    data: {
      user,
    },
  });
};

export function signup(req: Request, res: Response) {
  catchAsync(async () => {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });
    createSendToken(newUser, 201, res);
  });
}

export function login(req: Request, res: Response, next: NextFunction) {
  catchAsync(async () => {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
      return next(new AppError("Please provide email and password.", 400, res));
    }
    // Check if the user exists and password is correct
    const user = await User.findOne({ email: email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError("Incorrect email or password", 401, res));
    }

    createSendToken(user, 200, res);
  });
}
export function protect(req: Request, res: Response, next: NextFunction) {
  catchAsync(async () => {
    let token;
    // Check token/cookie exists
    const JWTCookie = req.headers.cookie?.startsWith("jwt")
      ? req.headers.cookie?.split("=")[1]
      : null;
    if (JWTCookie) {
      token = JWTCookie;
    }

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("You are not logged in.", 401, res));
    }

    // Verification
    const secret: Secret = process.env.JWT_SECRET as Secret;
    const decoded = jwt.verify(token, secret);
    console.log(decoded);

    // Check user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError("User belonging to this token does not exist.", 401, res)
      );
    }

    // check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          "User recently changed password, please log in again.",
          401,
          res
        )
      );
    }

    // Grant access to protected route
    res.locals.user = currentUser;
    next();
  });
}

export function restrictTo() {
  (...roles: Array<string>) =>
    // Roles is an array accessed via a closure
    (_req: Request, res: Response, next: NextFunction) => {
      // route.protect is always called before restrict,
      // it adds the current user (including role) into the request
      if (!roles.includes(res.locals.user.role)) {
        return next(
          new AppError(
            "You do not have permission to perform this action.",
            403,
            res
          )
        );
      }

      next();
    };
}

export function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  catchAsync(async () => {
    // Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(new AppError("No user with that email found", 404, res));
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\n
  If you didn't forget your password, please ignore this email.`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Your password reset token (Only valid for 10 mins)",
        message,
      });

      res.status(200).json({
        status: "success",
        message: "Token sent to email",
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError(
          "There was an error sending the email, try again later.",
          500,
          res
        )
      );
    }
  });
}

export function resetPassword(req: Request, res: Response, next: NextFunction) {
  catchAsync(async () => {
    // Get user based on token
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    // If token is not expired and user exists, set the new password
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(new AppError("Token is expired or invalid.", 400, res));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    // Log the user in, send JWT
    createSendToken(user, 201, res);
  });
}

export function updatePassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  catchAsync(async () => {
    // Get user from coollection
    const user = await User.findById(res.locals.user.id).select("+password");

    // Check if posted password is correct
    if (
      !(await user.correctPassword(req.body.currentPassword, user.password))
    ) {
      return next(new AppError("Your current password is wrong.", 403, res));
    }

    // If so, update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    // Use save instead of findByIdAndUpdate to run pre-save middleware
    await user.save();

    // Log user in, send JWT
    createSendToken(user, 201, res);
  });
}
