import { Document, HydratedDocument, Model } from 'mongoose';

// IUser === Type
export type UserType = Document & {
  name: string;
  email: string;
  password: string;
  phone: string;
  tokens: { token: string }[];
  userType: string;
};

export type UserMethodsType = UserType & {
  generateAuthToken(): Promise<string>;
  toJSON: () => object;
};

export type UserModelType = Model<UserType, object, UserMethodsType> & {
  findByCredentials(
    email: string,
    password: string
  ): Promise<HydratedDocument<UserType & UserMethodsType>>;
};
