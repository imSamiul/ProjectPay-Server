import mongoose from 'mongoose';

import { ClientType } from '../types/clientType';

const clientSchema = new mongoose.Schema<ClientType>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    clientPhone: {
      type: String,
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
const Client = mongoose.model<ClientType>('Client', clientSchema);

export default Client;
