
import Invoice, { IInvoice } from '../models/Invoice.model';
import Task from '../models/Task.model';
import Expense from '../models/Expense.model';
import Case from '../models/Case.model';
import mongoose from 'mongoose';

// Service to generate a new invoice for a case
export const generateInvoiceForCase = async (caseId: string, dueDate: Date, taxRate: number = 0, userId: mongoose.Types.ObjectId): Promise<IInvoice> => {
    const caseData = await Case.findById(caseId).populate('clients');
    if (!caseData || !caseData.clients.length) {
        throw new Error('Case not found or has no clients');
    }

    // 1. Find all unbilled tasks and expenses for this case
    const unbilledTasks = await Task.find({ relatedCase: caseId, cost: { $gt: 0 }, _id: { $nin: await getBilledSourceIds('task') } });
    const unbilledExpenses = await Expense.find({ relatedCase: caseId, isBilled: false });

    // 2. Prepare line items
    const lineItems: any[] = [];
    let subtotal = 0;

    unbilledTasks.forEach(task => {
        lineItems.push({
            description: `Task: ${task.title}`,
            quantity: task.hoursSpent,
            unitPrice: task.cost / task.hoursSpent,
            total: task.cost,
            source: { type: 'task', id: task._id }
        });
        subtotal += task.cost;
    });

    unbilledExpenses.forEach(expense => {
        lineItems.push({
            description: `Expense: ${expense.description}`,
            quantity: 1,
            unitPrice: expense.amount,
            total: expense.amount,
            source: { type: 'expense', id: expense._id }
        });
        subtotal += expense.amount;
    });

    if (lineItems.length === 0) {
        throw new Error('No unbilled tasks or expenses found for this case.');
    }

    // 3. Calculate totals
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    // 4. Create the invoice
    const invoiceCount = await Invoice.countDocuments();
    const invoice = await Invoice.create({
        invoiceNumber: `INV-${new Date().getFullYear()}-${(invoiceCount + 1).toString().padStart(4, '0')}`,
        relatedCase: caseId,
        relatedClient: caseData.clients[0], // Assuming the first client is the primary one for billing
        issueDate: new Date(),
        dueDate,
        lineItems,
        subtotal,
        tax,
        total,
        createdBy: userId,
    });

    // 5. Mark tasks and expenses as billed
    await Task.updateMany({ _id: { $in: unbilledTasks.map(t => t._id) } }, { $set: { /* We need a way to mark tasks as billed, maybe a field in the task model? For now, we rely on checking if the task id is in any invoice */ } });
    await Expense.updateMany({ _id: { $in: unbilledExpenses.map(e => e._id) } }, { $set: { isBilled: true } });

    return invoice;
};

// Helper to get all task/expense IDs that are already in an invoice
const getBilledSourceIds = async (type: 'task' | 'expense') => {
    const invoices = await Invoice.find({ "lineItems.source.type": type }).select('lineItems.source.id');
    return invoices.flatMap(inv => inv.lineItems.map(item => item.source.id));
}

export const getInvoiceById = async (invoiceId: string): Promise<IInvoice | null> => {
    return Invoice.findById(invoiceId).populate('relatedCase', 'title').populate('relatedClient', 'name');
}

export const getInvoicesForCase = async (caseId: string): Promise<IInvoice[]> => {
    return Invoice.find({ relatedCase: caseId });
}

export const getAllInvoices = async (filter: any, sort: any, limit: number, skip: number): Promise<IInvoice[]> => {
    return Invoice.find(filter).populate('relatedCase', 'title').populate('relatedClient', 'name').sort(sort).limit(limit).skip(skip);
};
