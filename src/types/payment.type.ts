import { Types } from 'mongoose';

export type Payment = {
  projectId: Types.ObjectId;
  paymentDate: Date;
  paymentAmount: number;
  paymentMethod: string;
  transactionId: string;
};
