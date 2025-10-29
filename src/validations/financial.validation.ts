
import { z } from 'zod';
import i18next from '../config/i18n.config';

const itemSchema = z.object({
  description: z.string().min(1, i18next.t('validation:description_required')),
  quantity: z.number().positive(i18next.t('validation:quantity_positive')),
  price: z.number().positive(i18next.t('validation:price_positive')),
});

export const createInvoiceSchema = z.object({
  body: z.object({
    clientId: z.string().regex(/^[0-9a-fA-F]{24}$/, i18next.t('validation:invalid_client_id')),
    caseId: z.string().regex(/^[0-9a-fA-F]{24}$/, i18next.t('validation:invalid_case_id')).optional(),
    items: z.array(itemSchema).min(1, i18next.t('validation:at_least_one_item')),
    dueDate: z.string().datetime(i18next.t('validation:invalid_datetime')),
  }),
});

export const createPaymentSchema = z.object({
  body: z.object({
    invoiceId: z.string().regex(/^[0-9a-fA-F]{24}$/, i18next.t('validation:invalid_invoice_id')),
    amount: z.number().positive(i18next.t('validation:amount_positive')),
    paymentMethod: z.string().min(1, i18next.t('validation:payment_method_required')),
  }),
});

export const createExpenseSchema = z.object({
  body: z.object({
    caseId: z.string().regex(/^[0-9a-fA-F]{24}$/, i18next.t('validation:invalid_case_id')),
    description: z.string().min(1, i18next.t('validation:description_required')),
    amount: z.number().positive(i18next.t('validation:amount_positive')),
  }),
});
