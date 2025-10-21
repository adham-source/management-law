
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
 *         description:
 *           type: string
 *         assignedTo:
 *           type: string
 *           description: ID of the user the task is assigned to
 *         relatedCase:
 *           type: string
 *           description: ID of the related case
 *         relatedClient:
 *           type: string
 *           description: ID of the related client
 *         dueDate:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [pending, in-progress, completed, on-hold]
 *         priority:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         category:
 *           type: string
 *           enum: [research, drafting, filing, client-meeting, court-appearance]
 *     TaskUpdateInput:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         assignedTo:
 *           type: string
 *           description: ID of the user the task is assigned to
 *         relatedCase:
 *           type: string
 *           description: ID of the related case
 *         relatedClient:
 *           type: string
 *           description: ID of the related client
 *         dueDate:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [pending, in-progress, completed, on-hold]
 *         priority:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         category:
 *           type: string
 *           enum: [research, drafting, filing, client-meeting, court-appearance]
 */
