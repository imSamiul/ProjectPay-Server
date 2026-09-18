import mongoose from "mongoose";
import User from "./user-model";
import { ManagerModelType, ManagerType } from "../types/manager-type";

const managerSchema = new mongoose.Schema<ManagerType>(
  {
    managerProjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    clientList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
      },
    ],
  },
  {
    timestamps: true,
  },
);

const ProjectManager = User.discriminator<ManagerType, ManagerModelType>(
  "project manager",
  managerSchema,
);

export default ProjectManager;
