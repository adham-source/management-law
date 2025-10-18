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
 *     responses:
 *       201:
 *         description: تم إنشاء الموعد بنجاح.
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
 *     responses:
 *       200:
 *         description: تم تحديث الموعد بنجاح.
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
 */
router.delete('/:id', authorize(['appointment:delete']), appointmentController.deleteAppointment);

export default router;