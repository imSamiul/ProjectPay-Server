import jwt from 'jsonwebtoken';
import User from '../model/userModel';
import { Request, Response, NextFunction } from 'express';

type JwtPayload = {
  id: string;
};

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
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
      throw new Error();
    }
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ message: 'Please authenticate', error });
  }
};
export default auth;
