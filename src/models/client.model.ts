import mongoose from 'mongoose';
import { Client, ClientMethods, ClientModel } from '../types/clientType';
import UserModel from './user.model';

const clientSchema = new mongoose.Schema<Client, ClientModel, ClientMethods>({
  clientProjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
  ],
  hasProjectInvitation: {
    type: Boolean,
    default: false,
  },
  projectInvitations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
  ],
});

// Use discriminator to extend the base schema for clients
const ClientModel = UserModel.discriminator<Client, ClientModel>(
  'client',
  clientSchema
);

export default ClientModel;
