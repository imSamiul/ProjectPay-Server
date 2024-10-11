import { Types } from 'mongoose';

export type PaymentType = {
  project: Types.ObjectId;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  note: string;
};
