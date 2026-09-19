import mongoose from 'mongoose';
import { UserType, UserMethodsType, UserModelType } from './user-type';

// IManager === Type
export type ManagerType = UserType & {
  managerProjects: mongoose.Types.ObjectId[];
};

export type ManagerMethodsType = UserMethodsType;

export type ManagerModelType = mongoose.Model<
  ManagerType,
  object,
  ManagerMethodsType
> &
  UserModelType;
