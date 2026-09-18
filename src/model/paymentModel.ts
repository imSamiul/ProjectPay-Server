import { model, Schema } from 'mongoose';
import { PaymentType } from '../types/paymentType';

const paymentSchema = new Schema<PaymentType>(
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

const Payment = model('Payment', paymentSchema);

export default Payment;
