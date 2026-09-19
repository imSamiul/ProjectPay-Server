import mongoose from "mongoose";
import { ClientType, ClientModelType } from "../types/client-type";
import User from "./user-model";

const clientSchema = new mongoose.Schema(
  {
    clientKey: {
      type: String,
      required: true,
      unique: true,
    },
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

const Client = User.discriminator<ClientType, ClientModelType>(
  "client",
  clientSchema,
);

export default Client;
