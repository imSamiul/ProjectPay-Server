import mongoose, { Document, HydratedDocument, Model } from 'mongoose';

export type UserType = Document & {
  _id: mongoose.Types.ObjectId;
  userName: string;
  email: string;
  userId: string;
  password: string;
  role: 'client' | 'admin' | 'project_manager';
  googleId: string;
  avatar: {
    data: string;
    type: string;
  };
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

export type UserInstanceType = HydratedDocument<UserType> & UserMethodsType;

export type UserModelType = Model<UserType, object, UserMethodsType> & {
  findByCredentials(
    email: string,
    password: string
  ): Promise<HydratedDocument<UserType & UserMethodsType>>;
};
