import mongoose, { Model } from "mongoose";
import { UserType, UserMethodsType, UserModelType } from "./user-type";

export type ClientType = UserType & {
  clientKey: string;
  projects: mongoose.Types.ObjectId[];
};

export type ClientMethodsType = UserMethodsType;

export type ClientModelType = Model<ClientType, object, ClientMethodsType> &
  UserModelType;
