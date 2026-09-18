import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../models/user-model";
import { UnauthorizedError } from "../utils/app-error";

type JwtPayload = {
  id: string;
};

export async function auth(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authentication token is missing or invalid");
    }

    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) {
      throw new UnauthorizedError("Authentication token is missing");
    }

    const jwtSecret = process.env.JWT_TOKEN;
    if (!jwtSecret) {
      throw new UnauthorizedError("JWT secret is missing in environment variables");
    }

    const { id } = jwt.verify(token, jwtSecret) as JwtPayload;
    const user = await User.findOne({ _id: id, "tokens.token": token }).select(
      "-password",
    );

    if (!user) {
      throw new UnauthorizedError("Not authorized to access this resource");
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
      return;
    }
    next(new UnauthorizedError("Not authorized to access this resource"));
  }
}
