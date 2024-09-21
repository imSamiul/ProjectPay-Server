import mongoose from 'mongoose';
import User from './userModel';

const managerSchema = new mongoose.Schema({
  // Specific fields for the client
  mProjects: [
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
});

const ProjectManager = User.discriminator('project-manager', managerSchema);

export default ProjectManager;
