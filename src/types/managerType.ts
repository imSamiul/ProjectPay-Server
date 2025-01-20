import mongoose, { Model } from 'mongoose';
import { User } from './user.type';

export type Manager = User & {
  managerProjects: mongoose.Types.ObjectId[];
  clientList: mongoose.Types.ObjectId[];
};
export type ManagerMethods = object;

export type ManagerModel = Model<Manager, object, ManagerMethods>;
