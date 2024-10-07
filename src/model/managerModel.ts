import mongoose from 'mongoose';
import User from './userModel';
import { IUser, UserModel } from '../interfaces/userDocumentType';

const managerSchema = new mongoose.Schema(
  {
    // Specific fields for the client
    myProjects: [
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

const ProjectManager = User.discriminator<IUser, UserModel>(
  'project-manager',
  managerSchema
);

export default ProjectManager;
