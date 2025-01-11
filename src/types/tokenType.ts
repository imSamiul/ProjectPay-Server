import mongoose from 'mongoose';

export type TokenType = {
  userId: mongoose.Types.ObjectId;
  refreshToken: string;
  expirationTime: number;
};
