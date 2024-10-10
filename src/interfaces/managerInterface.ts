import mongoose from 'mongoose';
import {
  IUser,
  IUserMethods,
  UserModel,
} from '../interfaces/userDocumentInterface';

export interface IManager extends IUser {
  managerProjects: mongoose.Types.ObjectId[];
  clientList: mongoose.Types.ObjectId[];
  age: number;
}

export type IMangerMethods = IUserMethods;

export type ManagerModel = mongoose.Model<IManager, object, IMangerMethods> &
  UserModel;
