
import mongoose, { Schema, Document } from 'mongoose';

export const invoiceStatuses = ['draft', 'sent', 'paid', 'void', 'overdue'];

export interface IInvoice extends Document {
  _id: mongoose.Types.ObjectId;
  invoiceNumber: string;
  relatedCase: mongoose.Types.ObjectId;
  relatedClient: mongoose.Types.ObjectId;
  issueDate: Date;
  dueDate: Date;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    source: {
        type: 'task' | 'expense';
        id: mongoose.Types.ObjectId;
    }
  }[];
  subtotal: number;
  tax: number; // Or a more complex tax object
  total: number;
  amountPaid: number;
  status: typeof invoiceStatuses[number];
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema: Schema<IInvoice> = new Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    relatedCase: { type: Schema.Types.ObjectId, ref: 'Case', required: true },
    relatedClient: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    lineItems: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        total: { type: Number, required: true },
        source: {
            type: { type: String, enum: ['task', 'expense'], required: true },
            id: { type: Schema.Types.ObjectId, required: true }
        }
      },
    ],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    status: { type: String, enum: invoiceStatuses, default: 'draft' },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema);

export default Invoice;
