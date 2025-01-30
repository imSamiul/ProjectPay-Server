import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Client, ClientMethods, ClientModel } from '../types/clientType';
import UserModel from './user.model';

const clientSchema = new mongoose.Schema<Client, ClientModel, ClientMethods>({
  clientId: {
    type: String,

    unique: true,
    index: true,
  },
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

// Modify the pre-validate middleware to ensure clientId is set
clientSchema.pre('validate', async function (next) {
  if (!this.clientId) {
    const uuid = uuidv4();
    this.clientId = `CL-${uuid.slice(0, 8)}`;
  }
  next();
});

// Use discriminator to extend the base schema for clients
const ClientModel = UserModel.discriminator<Client, ClientModel>(
  'client',
  clientSchema
);

export default ClientModel;
