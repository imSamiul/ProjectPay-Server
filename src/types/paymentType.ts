import { Types } from 'mongoose';

export type PaymentType = {
  projectId: Types.ObjectId;
  paymentDate: Date;
  paymentAmount: number;
  paymentMethod: string;
  transactionId: string;
};
