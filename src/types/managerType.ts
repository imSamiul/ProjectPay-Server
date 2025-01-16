import mongoose from 'mongoose';
import { UserType } from './user.type';

export type ManagerType = UserType & {
  userId: mongoose.Types.ObjectId;
  managerPhone: string;
  managerProjects: mongoose.Types.ObjectId[];
  clientList: mongoose.Types.ObjectId[];
};
