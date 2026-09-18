import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(
      {
        method: req.method,
        path: req.originalUrl || req.path,
        statusCode: res.statusCode,
        durationMs: duration,
      },
      `${req.method} ${req.path} ${res.statusCode} ${duration}ms`,
    );
  });

  next();
}
