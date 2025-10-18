
import { z } from 'zod';
import { invoiceStatuses } from '../models/Invoice.model';
import { paymentMethods } from '../models/Payment.model';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID');

export const createExpenseSchema = z.object({
  body: z.object({
    description: z.string().min(3),
    amount: z.number().positive(),
    date: z.string().datetime().optional(),
    relatedCase: objectIdSchema,
  }),
});

export const createInvoiceSchema = z.object({
  body: z.object({
    relatedCase: objectIdSchema,
    dueDate: z.string().datetime(),
    tax: z.number().min(0).optional(),
    notes: z.string().optional(),
  }),
});

export const recordPaymentSchema = z.object({
  body: z.object({
    invoice: objectIdSchema,
    amount: z.number().positive(),
    paymentDate: z.string().datetime().optional(),
    paymentMethod: z.enum(paymentMethods as [string, ...string[]]),
    transactionId: z.string().optional(),
    notes: z.string().optional(),
  }),
});
