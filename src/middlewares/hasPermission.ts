import { NextFunction, Request, Response } from 'express';

export const ROLE = {
  ADMIN: 'admin',
  CLIENT: 'client',
};

export function hasPermission(role: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user.role === role) {
      next();
    } else {
      res.status(403).json({ message: 'Forbidden' });
    }
  };
}
