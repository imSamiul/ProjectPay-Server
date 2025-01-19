import { Document, Model, Types } from 'mongoose';
export type Project = Document & {
  _id: Types.ObjectId;
  projectCode: string;
  name: string;
  budget: number;
  advance: number;
  due: number;
  totalPaid: number;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientAddress: string;
  clientDetails: string;
  startDate: string;
  endDate: string;
  demoLink: string;
  typeOfWeb: string;
  description: string;
  status: boolean;
  verifiedClientList: Types.ObjectId[];
  projectManager: Types.ObjectId;
  paymentList: Types.ObjectId[];
  hasClientRequest: boolean;
  requestedClientList: Types.ObjectId[];
  approvedClientList: Types.ObjectId[];
};

export type ProjectMethods = {
  recalculateAll: () => Promise<void>;
};

export type ProjectModel = Model<Project, object, ProjectMethods>;
