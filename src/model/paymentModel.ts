import { model, Schema } from 'mongoose';
import { PaymentType } from '../types/paymentType';

const paymentSchema = new Schema<PaymentType>({
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
  },
  amount: {
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
    type: String,
    required: true,
    default: new Date().toISOString().split('T')[0],
  },
  note: {
    type: String,
  },
});

const Payment = model('Payment', paymentSchema);

export default Payment;
