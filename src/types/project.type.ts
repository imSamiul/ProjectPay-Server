import { Document, Model, Types } from 'mongoose';
export type Project = Document & {
  _id: Types.ObjectId;
  projectCode: string;
  name: string;
  budget: number;
  advance: number;
  due: number;
  totalPaid: number;
  clientPhone: string;
  clientEmail: string;
  startDate: string;
  endDate: string;
  description: string;
  status: boolean;
  projectManager: Types.ObjectId;
  paymentList: Types.ObjectId[];
  approvedClientList: Types.ObjectId[];
};

export type ProjectMethods = {
  recalculateAll: () => Promise<void>;
};

export type ProjectModel = Model<Project, object, ProjectMethods>;
