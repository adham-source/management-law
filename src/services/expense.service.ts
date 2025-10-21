
import Expense, { IExpense } from '../models/Expense.model';
import mongoose from 'mongoose';

export const addExpense = async (input: Partial<IExpense>, userId: mongoose.Types.ObjectId): Promise<IExpense> => {
    return Expense.create({ ...input, createdBy: userId });
};

export const getExpensesForCase = async (caseId: string): Promise<IExpense[]> => {
    return Expense.find({ relatedCase: caseId });
};

export const getAllExpenses = async (filter: any, sort: any, limit: number, skip: number): Promise<IExpense[]> => {
    return Expense.find(filter).sort(sort).limit(limit).skip(skip);
};
