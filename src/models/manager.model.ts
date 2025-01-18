import mongoose from 'mongoose';
import { Manager, ManagerMethods, ManagerModel } from '../types/managerType';

const managerSchema = new mongoose.Schema<
  Manager,
  ManagerModel,
  ManagerMethods
>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

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
const ProjectManagerModel = mongoose.model<Manager, ManagerModel>(
  'ProjectManager',
  managerSchema
);

export default ProjectManagerModel;
