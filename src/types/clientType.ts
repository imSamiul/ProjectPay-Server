import mongoose, { Model } from 'mongoose';
import { User } from './user.type';

export type Client = User & {
  clientProjects: mongoose.Types.ObjectId[];
  hasProjectInvitation: boolean;
  projectInvitations: mongoose.Types.ObjectId[];
};
export type ClientMethods = object;

export type ClientModel = Model<Client, object, ClientMethods>;
