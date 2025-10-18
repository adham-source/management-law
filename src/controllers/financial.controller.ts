
import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import * as expenseService from '../services/expense.service';
import * as invoiceService from '../services/invoice.service';
import * as paymentService from '../services/payment.service';

// --- Expense Controllers ---
export const addExpense = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    const expense = await expenseService.addExpense(req.body, req.user._id);
    res.status(201).json(expense);
});

export const getCaseExpenses = asyncHandler(async (req: Request, res: Response) => {
    const { caseId } = req.params;
    const expenses = await expenseService.getExpensesForCase(caseId);
    res.status(200).json(expenses);
});

// --- Invoice Controllers ---
export const generateInvoice = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    const { relatedCase, dueDate, tax } = req.body;
    const invoice = await invoiceService.generateInvoiceForCase(relatedCase, dueDate, tax, req.user._id);
    res.status(201).json(invoice);
});

export const getInvoice = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const invoice = await invoiceService.getInvoiceById(id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    res.status(200).json(invoice);
});

export const getCaseInvoices = asyncHandler(async (req: Request, res: Response) => {
    const { caseId } = req.params;
    const invoices = await invoiceService.getInvoicesForCase(caseId);
    res.status(200).json(invoices);
});

// --- Payment Controllers ---
export const recordPayment = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    const payment = await paymentService.recordPayment(req.body, req.user._id);
    res.status(201).json(payment);
});
