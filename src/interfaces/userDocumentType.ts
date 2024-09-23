import { Model, Document } from 'mongoose';

// I=== Interface
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  tokens: { token: string }[];
}

export interface IUserMethods extends IUser {
  generateAuthToken(): Promise<string>;
  toJSON: () => object;
}

export interface UserModel extends Model<IUser, object, IUserMethods> {
  findByCredentials(
    email: string,
    password: string
  ): Promise<IUser & IUserMethods>;
}
