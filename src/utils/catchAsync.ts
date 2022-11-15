import { Request, Response, NextFunction } from "express";
// eslint-disable-next-line arrow-body-style
export const catchAsync = (fn: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
