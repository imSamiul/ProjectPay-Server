import { NextFunction, Request, Response } from 'express';
import Token from '../models/token.model';

import { verifyToken } from '../utils/auth';
import User from '../models/user.model';

const { ACCESS_TOKEN_SECRET } = process.env;

export async function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authToken = req.get('Authorization');
    const accessToken = authToken?.split('Bearer ')[1];
    if (!accessToken) {
      throw new Error('No access token found');
    }

    const { signedCookies = {} } = req;

    const { refreshToken } = signedCookies;
    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    const refreshTokenInDB = await Token.findOne({ refreshToken });

    if (!refreshTokenInDB) {
      throw new Error('Refresh token not found in database');
    }

    let userId;
    try {
      userId = verifyToken(accessToken, ACCESS_TOKEN_SECRET as string);
    } catch (error) {
      let errorMessage = 'Failed to do something exceptional';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      res.status(403).json({ message: errorMessage });
    }

    const user = User.findById({ _id: userId });
    if (!user) {
      throw new Error('User not found');
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
}
