
import { Router } from 'express';
import passport from 'passport';
import * as taskController from '../controllers/task.controller';
import validate from '../middlewares/validate';
import { authorize } from '../middlewares/authorize';
import { createTaskSchema, updateTaskSchema, logHoursSchema } from '../validations/task.validation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: المهام (Tasks)
 *   description: إدارة المهام وتكاليفها
 */

router.use(passport.authenticate('jwt', { session: false }));

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: إنشاء مهمة جديدة
 *     tags: [المهام (Tasks)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskInput'
 *     responses:
 *       201:
 *         description: تم إنشاء المهمة بنجاح.
 *       401:
 *         description: غير مصرح به.
 */
router.post('/', authorize(['task:create']), validate(createTaskSchema), taskController.createTask);

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: جلب قائمة المهام
 *     tags: [المهام (Tasks)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: قائمة بالمهام.
 *       401:
 *         description: غير مصرح به.
 */
router.get('/', authorize(['task:read']), taskController.getTasks);

/**
 * @swagger
 * /tasks/{id}:
 *   patch:
 *     summary: تحديث مهمة
 *     tags: [المهام (Tasks)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskUpdateInput'
 *     responses:
 *       200:
 *         description: تم تحديث المهمة بنجاح.
 *       401:
 *         description: غير مصرح به.
 */
router.patch('/:id', authorize(['task:update']), validate(updateTaskSchema), taskController.updateTask);

/**
 * @swagger
 * /tasks/{id}/log-hours:
 *   post:
 *     summary: تسجيل ساعات عمل على مهمة
 *     tags: [المهام (Tasks)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hours
 *             properties:
 *               hours:
 *                 type: number
 *                 example: 2.5
 *     responses:
 *       200:
 *         description: تم تسجيل الساعات وتحديث التكلفة.
 *       401:
 *         description: غير مصرح به.
 */
router.post('/:id/log-hours', authorize(['task:update']), validate(logHoursSchema), taskController.logHoursOnTask);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     TaskInput:
 *       type: object
 *       required:
 *         - title
 *         - assignedTo
 *         - category
 *       properties:
 *         title:
 *           type: string
 *           description: عنوان المهمة
 *         description:
 *           type: string
 *           description: وصف تفصيلي للمهمة (اختياري)
 *         assignedTo:
 *           type: string
 *           description: معرف المستخدم المسندة إليه المهمة
 *         relatedCase:
 *           type: string
 *           description: معرف القضية المرتبطة بالمهمة (اختياري)
 *         relatedClient:
 *           type: string
 *           description: معرف العميل المرتبط بالمهمة (اختياري)
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: تاريخ استحقاق المهمة (اختياري)
 *         status:
 *           type: string
 *           enum: [pending, in-progress, completed, on-hold]
 *           description: حالة المهمة
 *         priority:
 *           type: string
 *           enum: [low, medium, high, critical]
 *           description: أولوية المهمة
 *         category:
 *           type: string
 *           enum: [research, drafting, filing, client-meeting, court-appearance]
 *           description: فئة المهمة
 *     TaskUpdateInput:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: عنوان المهمة (اختياري)
 *         description:
 *           type: string
 *           description: وصف تفصيلي للمهمة (اختياري)
 *         assignedTo:
 *           type: string
 *           description: معرف المستخدم المسندة إليه المهمة (اختياري)
 *         relatedCase:
 *           type: string
 *           description: معرف القضية المرتبطة بالمهمة (اختياري)
 *         relatedClient:
 *           type: string
 *           description: معرف العميل المرتبط بالمهمة (اختياري)
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: تاريخ استحقاق المهمة (اختياري)
 *         status:
 *           type: string
 *           enum: [pending, in-progress, completed, on-hold]
 *           description: حالة المهمة (اختياري)
 *         priority:
 *           type: string
 *           enum: [low, medium, high, critical]
 *           description: أولوية المهمة (اختياري)
 *         category:
 *           type: string
 *           enum: [research, drafting, filing, client-meeting, court-appearance]
 *           description: فئة المهمة (اختياري)
 */
