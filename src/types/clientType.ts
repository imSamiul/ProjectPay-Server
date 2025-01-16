import mongoose from 'mongoose';
import { UserType } from './user.type';

export type ClientType = UserType & {
  userId: mongoose.Types.ObjectId;
  clientPhone: string;
  clientProjects: mongoose.Types.ObjectId[];
};
