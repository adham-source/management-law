
import { Router } from 'express';
import passport from 'passport';
import * as auditController from '../controllers/audit.controller';
import { authorize } from '../middlewares/authorize';

const router = Router();

// Protect all audit routes, only admins can view
router.use(passport.authenticate('jwt', { session: false }));
router.use(authorize(['audit:read']));

/**
 * @swagger
 * tags:
 *   name: التدقيق (Audit)
 *   description: عرض سجلات تدقيق النظام (للمدير فقط)
 */

/**
 * @swagger
 * /audit:
 *   get:
 *     summary: جلب سجلات التدقيق مع خيارات الفلترة والترتيب
 *     tags: [التدقيق (Audit)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: قائمة بسجلات التدقيق.
 */
router.get('/', auditController.getLogs);

export default router;
