
import Expense, { IExpense } from '../models/Expense.model';
import mongoose from 'mongoose';

export const addExpense = async (input: Partial<IExpense>, userId: mongoose.Types.ObjectId): Promise<IExpense> => {
    return Expense.create({ ...input, createdBy: userId });
};

export const getExpensesForCase = async (caseId: string): Promise<IExpense[]> => {
    return Expense.find({ relatedCase: caseId });
};
