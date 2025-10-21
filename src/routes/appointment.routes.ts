import { Router } from 'express';
import passport from 'passport';
import * as appointmentController from '../controllers/appointment.controller';
import validate from '../middlewares/validate';
import { authorize } from '../middlewares/authorize';
import { createAppointmentSchema, updateAppointmentSchema } from '../validations/appointment.validation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: المواعيد (Appointments)
 *   description: إدارة المواعيد والجلسات
 */

router.use(passport.authenticate('jwt', { session: false }));

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: إنشاء موعد جديد
 *     tags: [المواعيد (Appointments)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentInput'
 *     responses:
 *       201:
 *         description: تم إنشاء الموعد بنجاح.
 *       401:
 *         description: غير مصرح به.
 *       400:
 *         description: خطأ في المدخلات.
 */
router.post('/', authorize(['appointment:create']), validate(createAppointmentSchema), appointmentController.createAppointment);

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: جلب قائمة المواعيد
 *     tags: [المواعيد (Appointments)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: قائمة بالمواعيد.
 *       401:
 *         description: غير مصرح به.
 */
router.get('/', authorize(['appointment:read']), appointmentController.getAppointments);

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: جلب موعد معين بواسطة ID
 *     tags: [المواعيد (Appointments)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: بيانات الموعد.
 *       401:
 *         description: غير مصرح به.
 *       404:
 *         description: الموعد غير موجود.
 */
router.get('/:id', authorize(['appointment:read']), appointmentController.getAppointmentById);

/**
 * @swagger
 * /appointments/{id}:
 *   patch:
 *     summary: تحديث بيانات موعد
 *     tags: [المواعيد (Appointments)]
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
 *             $ref: '#/components/schemas/AppointmentInput'
 *     responses:
 *       200:
 *         description: تم تحديث الموعد بنجاح.
 *       401:
 *         description: غير مصرح به.
 *       404:
 *         description: الموعد غير موجود.
 */
router.patch('/:id', authorize(['appointment:update']), validate(updateAppointmentSchema), appointmentController.updateAppointment);

/**
 * @swagger
 * /appointments/{id}:
 *   delete:
 *     summary: حذف موعد
 *     tags: [المواعيد (Appointments)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: تم حذف الموعد بنجاح.
 *       401:
 *         description: غير مصرح به.
 *       404:
 *         description: الموعد غير موجود.
 */
router.delete('/:id', authorize(['appointment:delete']), appointmentController.deleteAppointment);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     AppointmentInput:
 *       type: object
 *       required:
 *         - title
 *         - startTime
 *         - endTime
 *       properties:
 *         title:
 *           type: string
 *           description: عنوان الموعد
 *         description:
 *           type: string
 *           description: وصف تفصيلي للموعد (اختياري)
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: وقت بدء الموعد
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: وقت انتهاء الموعد
 *         attendees:
 *           type: array
 *           items:
 *             type: string
 *             description: ID المستخدمين الحاضرين
 *         relatedCase:
 *           type: string
 *           description: ID القضية المرتبطة بالموعد (اختياري)
 *         location:
 *           type: string
 *           description: مكان الموعد (اختياري)
 *         status:
 *           type: string
 *           enum: [scheduled, completed, canceled, rescheduled]
 *           description: حالة الموعد (اختياري)
 */