import type { RequestHandler } from 'express';
import { UserType } from '../types/userType';

export const ensureAuthenticated: RequestHandler = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

export const ensureUserExists: RequestHandler = async (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    (req.user as UserType | null) = null;
    return next();
  }
};
