
import { Router } from 'express';
import passport from 'passport';
import * as googleController from '../controllers/google.controller';

const router = Router();

// All routes are protected
router.use(passport.authenticate('jwt', { session: false }));

/**
 * @swagger
 * tags:
 *   name: تكامل جوجل (Google Integration)
 *   description: مسارات ربط حساب جوجل الخاص بالمستخدم
 */

/**
 * @swagger
 * /google/calendar/authorize:
 *   get:
 *     summary: بدء عملية ربط تقويم جوجل
 *     tags: [تكامل جوجل (Google Integration)]
 *     description: يقوم هذا المسار بإعادة توجيه المستخدم إلى شاشة موافقة جوجل لمنح الإذن بالوصول إلى التقويم.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       302:
 *         description: إعادة توجيه إلى صفحة موافقة جوجل.
 */
router.get('/calendar/authorize', googleController.authorizeCalendar);

/**
 * @swagger
 * /google/calendar/callback:
 *   get:
 *     summary: مسار العودة (Callback) بعد موافقة جوجل
 *     tags: [تكامل جوجل (Google Integration)]
 *     description: يستقبل هذا المسار الرمز من جوجل بعد موافقة المستخدم، ويقوم بحفظ رموز الوصول.
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: الرمز الذي تم إرجاعه من جوجل.
 *     responses:
 *       200:
 *         description: تم ربط التقويم بنجاح.
 *       500:
 *         description: فشل في ربط التقويم.
 */
router.get('/calendar/callback', googleController.calendarCallback);

export default router;
