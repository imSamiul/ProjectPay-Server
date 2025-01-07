// TODO: will delete auth.ts

import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';

type JwtPayload = {
  id: string;
};

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Authentication token is missing or invalid');
    }

    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      throw new Error('Authentication token is missing');
    }
    const jwtSecret = process.env.JWT_TOKEN;
    if (!jwtSecret) {
      throw new Error('JWT secret is missing in environment variables');
    }

    const { id } = jwt.verify(token, jwtSecret) as JwtPayload;

    const user = await User.findOne({ _id: id, 'tokens.token': token });
    if (!user) {
      throw new Error('User not found');
    }
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message); // Log the error message
      res.status(401).json({ message: error.message });
    } else {
      console.log('An unexpected error occurred', error);
      res
        .status(401)
        .json({ message: 'Not authorized to access this resource' });
    }
  }
};
export default auth;
