import mongoose from 'mongoose';
import { Client, ClientMethods, ClientModel } from '../types/clientType';

const clientSchema = new mongoose.Schema<Client, ClientModel, ClientMethods>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Specific fields for the client
    clientProjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
      },
    ], // List of project IDs connected to the client
  },
  {
    timestamps: true,
  }
);

// Use discriminator to extend the base schema for clients
const ClientModel = mongoose.model<Client, ClientModel>('Client', clientSchema);

export default ClientModel;
