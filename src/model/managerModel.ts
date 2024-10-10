import mongoose from 'mongoose';
import User from './userModel';

import { IUser, UserModel } from '../interfaces/userDocumentInterface';

const managerSchema = new mongoose.Schema(
  {
    managerProjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
      },
    ], // List of project IDs connected to the client
    clientList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Update: Pass UserModel instead of IUser
const ProjectManager = User.discriminator<IUser, UserModel>(
  'project-manager',
  managerSchema
);

export default ProjectManager;
