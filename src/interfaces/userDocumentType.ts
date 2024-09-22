import mongoose from 'mongoose';

export interface UserDocument extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  tokens: { token: string }[];
  generateAuthToken(): Promise<string>;
}
