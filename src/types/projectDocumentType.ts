import { Document, Types } from 'mongoose';
export type ProjectType = Document & {
  name: string;
  budget: number;
  advance: number;
  due: number;
  client: string;
  clientPhone: string;
  clientEmail: string;

  startDate: string;
  endDate: string;

  description: string;
  status: boolean;
  verifiedClientList: Types.ObjectId[];
};
