import mongoose, { Schema } from 'mongoose';
import { Payment } from '../types/payment.type';

const paymentSchema = new Schema<Payment>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    paymentAmount: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      required: true,
    },
    transactionId: {
      type: String,
    },
    paymentDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const PaymentModel = mongoose.model<Payment>('Payment', paymentSchema);

export default PaymentModel;
