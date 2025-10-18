
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
 *     responses:
 *       201:
 *         description: تم إنشاء المهمة بنجاح.
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
 */
router.get('/', authorize(['task:read']), taskController.getTasks);

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
 *             properties:
 *               hours:
 *                 type: number
 *     responses:
 *       200:
 *         description: تم تسجيل الساعات وتحديث التكلفة.
 */
router.post('/:id/log-hours', authorize(['task:update']), validate(logHoursSchema), taskController.logHoursOnTask);

export default router;
