import mongoose from 'mongoose';
import { UserType, UserMethodsType, UserModelType } from './userType';

// IManager === Type
export type ManagerType = UserType & {
  managerProjects: mongoose.Types.ObjectId[];
  clientList: mongoose.Types.ObjectId[];
};

export type ManagerMethodsType = UserMethodsType;

export type ManagerModelType = mongoose.Model<
  ManagerType,
  object,
  ManagerMethodsType
> &
  UserModelType;
