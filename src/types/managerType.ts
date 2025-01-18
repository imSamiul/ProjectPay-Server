import mongoose, { Model } from 'mongoose';
import { User } from './user.type';

export type Manager = User & {
  userId: mongoose.Types.ObjectId;
  managerPhone: string;
  managerProjects: mongoose.Types.ObjectId[];
  clientList: mongoose.Types.ObjectId[];
};
export type ManagerMethods = object;

export type ManagerModel = Model<Manager, object, ManagerMethods>;
