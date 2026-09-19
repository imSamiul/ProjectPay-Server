import { Document, HydratedDocument, Model } from "mongoose";

export type UserType = Document & {
  name?: string;
  email?: string;
  password: string;
  phone?: string;
  tokens: { token: string }[];
  userType: "client" | "project manager" | "admin";
  createdAt: Date;
  updatedAt: Date;
};

export type UserMethodsType = UserType & {
  generateAuthToken(): Promise<string>;
  toJSON: () => object;
};

export type UserModelType = Model<UserType, object, UserMethodsType> & {
  findByCredentials(
    identifier: string,
    password: string
  ): Promise<HydratedDocument<UserType & UserMethodsType>>;
};
