import mongoose from "mongoose";
import { UserType, UserModelType } from "../types/user-type";
import User from "./user-model";

const clientSchema = new mongoose.Schema(
  {
    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Client = User.discriminator<UserType, UserModelType>(
  "client",
  clientSchema,
);

export default Client;
