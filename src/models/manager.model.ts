import mongoose from 'mongoose';

import { ManagerType } from '../types/managerType';

const managerSchema = new mongoose.Schema<ManagerType>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // TODO: Add required: true
    },
    managerPhone: {
      type: String,
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
const ProjectManager = mongoose.model<ManagerType>(
  'ProjectManager',
  managerSchema
);

export default ProjectManager;
