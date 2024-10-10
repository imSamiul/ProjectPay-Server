import mongoose from 'mongoose';
import User from './userModel';
import { ManagerModelType, ManagerType } from '../types/managerType';

const managerSchema = new mongoose.Schema<ManagerType>(
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
    age: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Update: Pass UserModel instead of IUser
const ProjectManager = User.discriminator<ManagerType, ManagerModelType>(
  'projectManager',
  managerSchema
);

export default ProjectManager;
