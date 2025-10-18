
import mongoose, { Schema, Document } from 'mongoose';

export const paymentMethods = ['cash', 'bank_transfer', 'credit_card', 'check'];

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId;
  invoice: mongoose.Types.ObjectId;
  amount: number;
  paymentDate: Date;
  paymentMethod: typeof paymentMethods[number];
  transactionId?: string; // For electronic payments
  notes?: string;
  recordedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema<IPayment> = new Schema(
  {
    invoice: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true },
    amount: { type: Number, required: true },
    paymentDate: { type: Date, default: Date.now },
    paymentMethod: { type: String, enum: paymentMethods, required: true },
    transactionId: { type: String },
    notes: { type: String },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
