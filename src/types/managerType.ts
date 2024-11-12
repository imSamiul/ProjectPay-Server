import mongoose from 'mongoose';
import { UserType } from './userType';

export type ManagerType = UserType & {
  userId: mongoose.Types.ObjectId;
  managerPhone: string;
  managerProjects: mongoose.Types.ObjectId[];
  clientList: mongoose.Types.ObjectId[];
};
