import { Request, Response, NextFunction } from "express";

export function notFound(
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  res.status(404).json({
    success: false,
    error: "NOT_FOUND",
    message: "Route not found",
  });
}
