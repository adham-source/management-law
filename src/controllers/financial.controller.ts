
import { Request, Response } from 'express';
import { IUser } from '../models/User.model';
import asyncHandler from '../utils/asyncHandler';
import * as expenseService from '../services/expense.service';
import * as invoiceService from '../services/invoice.service';
import * as paymentService from '../services/payment.service';
import { buildFilter, buildSort, buildPagination } from '../utils/query.utils';

// --- Expense Controllers ---
export const createExpense = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    const user = req.user as IUser;
    const expense = await expenseService.addExpense(req.body, user._id);
    res.status(201).json(expense);
});

export const getExpenses = asyncHandler(async (req: Request, res: Response) => {
    const filter = buildFilter(req.query, ['relatedCase']);
    const sort = buildSort(req.query);
    const { limit, skip } = buildPagination(req.query);
    const expenses = await expenseService.getAllExpenses(filter, sort, limit, skip);
    res.status(200).json(expenses);
});

// --- Invoice Controllers ---
export const generateInvoice = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    const user = req.user as IUser;
    const { relatedCase, dueDate, tax } = req.body;
    const invoice = await invoiceService.generateInvoiceForCase(relatedCase, dueDate, tax, user._id);
    res.status(201).json(invoice);
});

export const getInvoices = asyncHandler(async (req: Request, res: Response) => {
    const filter = buildFilter(req.query, ['relatedCase', 'status']);
    const sort = buildSort(req.query);
    const { limit, skip } = buildPagination(req.query);
    const invoices = await invoiceService.getAllInvoices(filter, sort, limit, skip);
    res.status(200).json(invoices);
});

export const getInvoiceById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const invoice = await invoiceService.getInvoiceById(id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.status(200).json(invoice);
});

// --- Payment Controllers ---
export const recordPayment = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    const user = req.user as IUser;
    const payment = await paymentService.recordPayment(req.body, user._id);
    res.status(201).json(payment);
});

export const getPaymentsByInvoice = asyncHandler(async (req: Request, res: Response) => {
    const { invoiceId } = req.params;
    const payments = await paymentService.getPaymentsForInvoice(invoiceId);
    res.status(200).json(payments);
});
