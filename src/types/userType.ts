import mongoose, { Document, HydratedDocument, Model } from 'mongoose';

export type UserType = Document & {
  _id?: mongoose.Types.ObjectId;
  name: string;
  googleId: string;
  photo?: string;
  email: string;
  password: string;
  role?: 'client' | 'admin' | 'project_manager';
  tokens: { token: string }[];
};

export type SignUpFormType = {
  name: string;
  email: string;
  password: string;
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
