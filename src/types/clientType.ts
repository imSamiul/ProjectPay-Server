import mongoose, { Model } from 'mongoose';
import { User } from './user.type';

export type Client = User & {
  userId: mongoose.Types.ObjectId;
  clientPhone: string;
  clientProjects: mongoose.Types.ObjectId[];
};
export type ClientMethods = object;

export type ClientModel = Model<Client, object, ClientMethods>;
