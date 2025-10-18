import { Router } from 'express';
import passport from 'passport';
import * as notificationController from '../controllers/notification.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: الإشعارات (Notifications)
 *   description: إدارة إشعارات المستخدم
 */

router.use(passport.authenticate('jwt', { session: false }));

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: جلب جميع إشعارات المستخدم الحالي
 *     tags: [الإشعارات (Notifications)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: قائمة بالإشعارات.
 */
router.get('/', notificationController.getMyNotifications);

/**
 * @swagger
 * /notifications/read/all:
 *   patch:
 *     summary: تحديد جميع الإشعارات كمقروءة
 *     tags: [الإشعارات (Notifications)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: تم تحديد الكل كمقروء.
 */
router.patch('/read/all', notificationController.markAllAsRead);

/**
 * @swagger
 * /notifications/read/{id}:
 *   patch:
 *     summary: تحديد إشعار معين كمقروء
 *     tags: [الإشعارات (Notifications)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: تم تحديد الإشعار كمقروء.
 */
router.patch('/read/:id', notificationController.markAsRead);

export default router;