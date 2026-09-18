import { model, Schema } from "mongoose";
import { PaymentType } from "../types/payment-type";

const paymentSchema = new Schema<PaymentType>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      index: true,
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
  },
);

paymentSchema.index({ projectId: 1 });

const Payment = model("Payment", paymentSchema);

export default Payment;
