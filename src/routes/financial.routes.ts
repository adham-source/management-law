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
 *             type: object
 *             properties:
 *               relatedCase: { type: string }
 *               dueDate: { type: string, format: date-time }
 *     responses:
 *       201:
 *         description: تم إنشاء الفاتورة بنجاح.
 */
router.post('/invoices/generate', authorize(['invoice:create']), validate(createInvoiceSchema), financialController.generateInvoice);

/**
 * @swagger
 * /financials/payments:
 *   post:
 *     summary: تسجيل دفعة مالية لفاتورة
 *     tags: [المالية (Financials)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: تم تسجيل الدفعة بنجاح.
 */
router.post('/payments', authorize(['payment:create']), validate(recordPaymentSchema), financialController.recordPayment);

export default router;