import { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "../utils/app-error";

type UserRole = "client" | "project manager" | "admin";

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError());
      return;
    }

    if (!roles.includes(req.user.userType)) {
      next(new ForbiddenError("You are not authorized to access this resource"));
      return;
    }

    next();
  };
}
