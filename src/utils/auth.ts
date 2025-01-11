import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Token from '../models/token.model';
import mongoose from 'mongoose';

type JwtPayload = {
  userId: mongoose.Types.ObjectId;
};

const dev = process.env.NODE_ENV === 'development';

export const generateJWT = (
  userId: mongoose.Types.ObjectId,
  secret: string,
  expirationTime: string
) => {
  return jwt.sign(
    {
      userId,
    },
    secret,
    { expiresIn: expirationTime }
  );
};
export const clearTokens = async (req: Request, res: Response) => {
  try {
    const { signedCookies = {} } = req;

    const { refreshToken } = signedCookies;
    if (refreshToken) {
      await Token.findOneAndDelete({ refreshToken });
    }
    if (!res.headersSent) {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: !dev,
        signed: true,
      });
    }
  } catch (error) {
    console.error('Error clearing tokens:', error);
  }
};
export const verifyToken = (token: string, secret: string) => {
  console.log(token, secret);

  const { userId } = jwt.verify(token, secret) as JwtPayload;
  return userId;
};
