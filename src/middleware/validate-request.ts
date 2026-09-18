import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

type ParsedRequest = {
  body?: unknown;
  query?: unknown;
  params?: unknown;
};

export function validateRequest(schema: ZodType<ParsedRequest>) {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (parsed.body !== undefined) {
        req.body = parsed.body;
      }
      if (parsed.query !== undefined) {
        Object.assign(req.query, parsed.query as Record<string, unknown>);
      }
      if (parsed.params !== undefined) {
        Object.assign(req.params, parsed.params as Record<string, unknown>);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
