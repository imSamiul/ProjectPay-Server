import mongoose, { Document, Model } from 'mongoose';

export type User = Document & {
  _id: mongoose.Types.ObjectId;
  userName: string;
  email: string;
  password: string;
  role: string;
  googleId: string;
  avatar: {
    data: string;
    type: string;
  };
};

export type SignupCredentials = {
  userName: string;
  email: string;
  password: string;
  role: string;
};

export type UserMethods = {
  createAccessToken(): Promise<string>;
  createRefreshToken(): Promise<string>;
};

export type UserModel = Model<User, object, UserMethods>;
