import mongoose, { Model } from 'mongoose';
import { User, UserMethods } from './user.type';

export type Manager = User & {
  managerProjects: mongoose.Types.ObjectId[];
  clientList: mongoose.Types.ObjectId[];
};
export type ManagerMethods = UserMethods & object;

export type ManagerModel = Model<Manager, object, ManagerMethods>;
