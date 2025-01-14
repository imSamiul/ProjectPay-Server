import mongoose, { Model } from 'mongoose';

export type TToken = {
  userId: mongoose.Types.ObjectId;
  refreshToken: string;
  expirationTime: Date;
};

export type TTokenMethods = object;

export type TokenModel = Model<TToken, object, TTokenMethods>;
