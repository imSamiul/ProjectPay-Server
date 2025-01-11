import jwt from 'jsonwebtoken';
import { UserType } from '../types/userType';
import mongoose from 'mongoose';

export const generateAccessToken = (user: {
  _id: mongoose.Types.ObjectId;
  roles: string[];
}) => {
  const jwtSecret = process.env.JWT_SECRET as string;
  return jwt.sign(
    { UserInfo: { id: user._id, roles: user.roles } },
    jwtSecret,
    {
      expiresIn: '1h',
    }
  );
};

export const generateRefreshToken = (user: UserType) => {
  const jwtSecret = process.env.REFRESH_TOKEN_SECRET as string;
  return jwt.sign({ id: user._id }, jwtSecret, {
    expiresIn: '7d',
  });
};
