
import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  _id: mongoose.Types.ObjectId;
  description: string;
  amount: number;
  date: Date;
  relatedCase: mongoose.Types.ObjectId;
  isBilled: boolean; // To track if this expense has been added to an invoice
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema: Schema<IExpense> = new Schema(
  {
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    relatedCase: { type: Schema.Types.ObjectId, ref: 'Case', required: true },
    isBilled: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const Expense = mongoose.model<IExpense>('Expense', ExpenseSchema);

export default Expense;
