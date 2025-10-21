import { Router } from 'express';
import passport from 'passport';
import * as caseController from '../controllers/case.controller';
import validate from '../middlewares/validate';
import { authorize } from '../middlewares/authorize';
import { createCaseSchema, updateCaseSchema } from '../validations/case.validation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: القضايا (Cases)
 *   description: إدارة القضايا وتفاصيلها
 */

router.use(passport.authenticate('jwt', { session: false }));

/**
 * @swagger
 * /cases:
 *   post:
 *     summary: إنشاء قضية جديدة
 *     tags: [القضايا (Cases)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CaseInput'
 *     responses:
 *       201:
 *         description: تم إنشاء القضية بنجاح.
 *       401:
 *         description: غير مصرح به.
 */
router.post('/', authorize(['case:create']), validate(createCaseSchema), caseController.createCase);

/**
 * @swagger
 * /cases:
 *   get:
 *     summary: جلب قائمة القضايا
 *     tags: [القضايا (Cases)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: قائمة بالقضايا.
 *       401:
 *         description: غير مصرح به.
 */
router.get('/', authorize(['case:read']), caseController.getCases);

/**
 * @swagger
 * /cases/{id}:
 *   get:
 *     summary: جلب قضية معينة بواسطة ID
 *     tags: [القضايا (Cases)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: بيانات القضية.
 *       401:
 *         description: غير مصرح به.
 */
router.get('/:id', authorize(['case:read']), caseController.getCaseById);

/**
 * @swagger
 * /cases/{id}:
 *   patch:
 *     summary: تحديث بيانات قضية
 *     tags: [القضايا (Cases)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: تم تحديث القضية بنجاح.
 *       401:
 *         description: غير مصرح به.
 */
router.patch('/:id', authorize(['case:update']), validate(updateCaseSchema), caseController.updateCase);

/**
 * @swagger
 * /cases/{id}:
 *   delete:
 *     summary: حذف قضية
 *     tags: [القضايا (Cases)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: تم حذف القضية بنجاح.
 *       401:
 *         description: غير مصرح به.
 */
router.delete('/:id', authorize(['case:delete']), caseController.deleteCase);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     CaseInput:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         caseNumber:
 *           type: string
 *         description:
 *           type: string
 *         caseType:
 *           type: string
 *         court:
 *           type: string
 *         clients:
 *           type: array
 *           items:
 *             type: string
 *             description: ID of a client
 *         assignedLawyers:
 *           type: array
 *           items:
 *             type: string
 *             description: ID of a user (lawyer)
 */