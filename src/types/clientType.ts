import mongoose, { Model } from 'mongoose';
import { User, UserMethods } from './user.type';

export type Client = User & {
  clientId: string;
  clientProjects: mongoose.Types.ObjectId[];
  hasProjectInvitation: boolean;
  projectInvitations: mongoose.Types.ObjectId[];
};
export type ClientMethods = UserMethods & object;

export type ClientModel = Model<Client, object, ClientMethods>;
