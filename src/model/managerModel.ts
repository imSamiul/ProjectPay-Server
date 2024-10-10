import mongoose from 'mongoose';
import User from './userModel';
import { IManager, ManagerModel } from '../interfaces/managerInterface';

const managerSchema = new mongoose.Schema<IManager>(
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
const ProjectManager = User.discriminator<IManager, ManagerModel>(
  'projectManager',
  managerSchema
);

export default ProjectManager;
