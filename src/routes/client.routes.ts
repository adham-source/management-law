import { Router } from 'express';
import passport from 'passport';
import * as clientController from '../controllers/client.controller';
import validate from '../middlewares/validate';
import { authorize } from '../middlewares/authorize';
import { createClientSchema, updateClientSchema } from '../validations/client.validation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: العملاء (Clients)
 *   description: إدارة بيانات العملاء
 */

router.use(passport.authenticate('jwt', { session: false }));

/**
 * @swagger
 * /clients:
 *   post:
 *     summary: إنشاء عميل جديد
 *     tags: [العملاء (Clients)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClientInput'
 *     responses:
 *       201:
 *         description: تم إنشاء العميل بنجاح.
 *       403:
 *         description: غير مصرح به.
 */
router.post('/', authorize(['client:create']), validate(createClientSchema), clientController.createClient);

/**
 * @swagger
 * /clients:
 *   get:
 *     summary: جلب قائمة العملاء
 *     tags: [العملاء (Clients)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: قائمة بالعملاء.
 *       403:
 *         description: غير مصرح به.
 */
router.get('/', authorize(['client:read']), clientController.getClients);

/**
 * @swagger
 * /clients/{id}:
 *   get:
 *     summary: جلب عميل معين بواسطة ID
 *     tags: [العملاء (Clients)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID العميل
 *     responses:
 *       200:
 *         description: بيانات العميل.
 *       404:
 *         description: العميل غير موجود.
 */
router.get('/:id', authorize(['client:read']), clientController.getClientById);

/**
 * @swagger
 * /clients/{id}:
 *   patch:
 *     summary: تحديث بيانات عميل
 *     tags: [العملاء (Clients)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID العميل
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClientInput'
 *     responses:
 *       200:
 *         description: تم تحديث العميل بنجاح.
 *       404:
 *         description: العميل غير موجود.
 */
router.patch('/:id', authorize(['client:update']), validate(updateClientSchema), clientController.updateClient);

/**
 * @swagger
 * /clients/{id}:
 *   delete:
 *     summary: حذف عميل
 *     tags: [العملاء (Clients)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID العميل
 *     responses:
 *       200:
 *         description: تم حذف العميل بنجاح.
 *       404:
 *         description: العميل غير موجود.
 */
router.delete('/:id', authorize(['client:delete']), clientController.deleteClient);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     ClientInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         nationalId:
 *           type: string
 *           description: الرقم القومي المصري (14 رقم)
 *         address:
 *           type: object
 *           properties:
 *             street: { type: string }
 *             city: { type: string }
 *             governorate: { type: string }
 *             zip: { type: string }
 *         phoneNumbers:
 *           type: array
 *           items: { type: string }
 *         email:
 *           type: string
 *           format: email
 *         clientType:
 *           type: string
 *           enum: [individual, corporate]
 *         contactPerson:
 *           type: object
 *           description: مطلوب إذا كان نوع العميل شركة
 *           properties:
 *             name: { type: string }
 *             email: { type: string }
 *             phone: { type: string }
 *         emergencyContact:
 *           type: object
 *           properties:
 *             name: { type: string }
 *             relationship: { type: string }
 *             phone: { type: string }
 *         notes:
 *           type: string
 */