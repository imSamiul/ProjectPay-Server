import { Schema } from 'mongoose';
import { Manager, ManagerMethods, ManagerModel } from '../types/managerType';
import UserModel from './user.model';

const managerSchema = new Schema<Manager, ManagerModel, ManagerMethods>({
  managerProjects: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
  ],
  clientList: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Client',
    },
  ],
});

const ProjectManagerModel = UserModel.discriminator<Manager, ManagerModel>(
  'project_manager',
  managerSchema
);

export default ProjectManagerModel;
