import mongoose from 'mongoose';
import { UserType } from './userType';

export type ClientType = UserType & {
  userId: mongoose.Types.ObjectId;
  clientPhone: string;
  clientProjects: mongoose.Types.ObjectId[];
};
