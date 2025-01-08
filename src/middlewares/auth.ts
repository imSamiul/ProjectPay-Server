import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

type JwtPayload = {
  UserInfo: {
    id: string;
    roles: string[];
  };
};

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Authentication token is missing');
    }

    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      throw new Error('Authentication token is missing');
    }
    const jwtSecret = process.env.JWT_SECRET as string;

    jwt.verify(token, jwtSecret, (err, decode) => {
      if (err || !decode) {
        throw new Error('Authentication token is invalid');
      }

      req.user = (decode as JwtPayload).UserInfo.id;
      req.roles = (decode as JwtPayload).UserInfo.roles;

      next();
    });
  } catch (error) {
    let errorMessage = 'Failed to do something exceptional';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(403).json({ message: errorMessage });
  }
};
export default auth;
