import mongoose from 'mongoose';
import User from './userModel';
import { IUser, UserModel } from '../interfaces/userDocumentType';

const clientSchema = new mongoose.Schema(
  {
    // Specific fields for the client
    projects: [
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
const Client = User.discriminator<IUser, UserModel>('client', clientSchema);

export default Client;
