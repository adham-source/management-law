import { Router } from 'express';
import passport from 'passport';
import * as financialController from '../controllers/financial.controller';
import validate from '../middlewares/validate';
import { authorize } from '../middlewares/authorize';
import { createExpenseSchema, createInvoiceSchema, recordPaymentSchema } from '../validations/financial.validation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: المالية (Financials)
 *   description: إدارة الفواتير والمصروفات والمدفوعات
 */

router.use(passport.authenticate('jwt', { session: false }));

// --- Invoice Routes ---

/**
 * @swagger
 * /financials/invoices/generate:
 *   post:
 *     summary: إنشاء فاتورة جديدة من بنود غير مفوترة
 *     tags: [المالية (Financials)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InvoiceGenerateInput'
 *     responses:
 *       201:
 *         description: تم إنشاء الفاتورة بنجاح.
 *       401:
 *         description: غير مصرح به.
 */
router.post('/invoices/generate', authorize(['invoice:create']), validate(createInvoiceSchema), financialController.generateInvoice);

/**
 * @swagger
 * /financials/invoices:
 *   get:
 *     summary: جلب جميع الفواتير
 *     tags: [المالية (Financials)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: قائمة بالفواتير.
 *       401:
 *         description: غير مصرح به.
 */
router.get('/invoices', authorize(['invoice:read']), financialController.getInvoices);

/**
 * @swagger
 * /financials/invoices/{id}:
 *   get:
 *     summary: جلب فاتورة معينة بواسطة ID
 *     tags: [المالية (Financials)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: تفاصيل الفاتورة.
 *       401:
 *         description: غير مصرح به.
 */
router.get('/invoices/:id', authorize(['invoice:read']), financialController.getInvoiceById);

// --- Payment Routes ---

/**
 * @swagger
 * /financials/payments:
 *   post:
 *     summary: تسجيل دفعة مالية لفاتورة
 *     tags: [المالية (Financials)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentInput'
 *     responses:
 *       201:
 *         description: تم تسجيل الدفعة بنجاح.
 *       401:
 *         description: غير مصرح به.
 */
router.post('/payments', authorize(['payment:create']), validate(recordPaymentSchema), financialController.recordPayment);

/**
 * @swagger
 * /financials/payments/invoice/{invoiceId}:
 *   get:
 *     summary: جلب الدفعات الخاصة بفاتورة معينة
 *     tags: [المالية (Financials)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *     responses:
 *       200:
 *         description: قائمة بالدفعات.
 *       401:
 *         description: غير مصرح به.
 */
router.get('/payments/invoice/:invoiceId', authorize(['invoice:read']), financialController.getPaymentsByInvoice);

// --- Expense Routes ---

/**
 * @swagger
 * /financials/expenses:
 *   post:
 *     summary: تسجيل مصروف جديد
 *     tags: [المالية (Financials)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExpenseInput'
 *     responses:
 *       201:
 *         description: تم تسجيل المصروف بنجاح.
 *       401:
 *         description: غير مصرح به.
 */
router.post('/expenses', authorize(['expense:create']), validate(createExpenseSchema), financialController.createExpense);

/**
 * @swagger
 * /financials/expenses:
 *   get:
 *     summary: جلب جميع المصروفات
 *     tags: [المالية (Financials)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: قائمة بالمصروفات.
 *       401:
 *         description: غير مصرح به.
 */
router.get('/expenses', authorize(['expense:read']), financialController.getExpenses);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     InvoiceGenerateInput:
 *       type: object
 *       required:
 *         - relatedCase
 *         - dueDate
 *       properties:
 *         relatedCase:
 *           type: string
 *           description: ID of the case to generate the invoice for
 *         dueDate:
 *           type: string
 *           format: date-time
 *         tax:
 *           type: number
 *         notes:
 *           type: string
 *     PaymentInput:
 *       type: object
 *       required:
 *         - invoice
 *         - amount
 *         - paymentMethod
 *       properties:
 *         invoice:
 *           type: string
 *           description: ID of the invoice being paid
 *         amount:
 *           type: number
 *         paymentDate:
 *           type: string
 *           format: date-time
 *         paymentMethod:
 *           type: string
 *           enum: [cash, bank-transfer, credit-card, check]
 *         transactionId:
 *           type: string
 *         notes:
 *           type: string
 *     ExpenseInput:
 *       type: object
 *       required:
 *         - description
 *         - amount
 *         - relatedCase
 *       properties:
 *         description:
 *           type: string
 *         amount:
 *           type: number
 *         date:
 *           type: string
 *           format: date-time
 *         relatedCase:
 *           type: string
 *           description: ID of the case this expense is for
 */