
import { Router } from 'express';
import passport from 'passport';
import * as userController from '../controllers/user.controller';
import validate from '../middlewares/validate';
import { authorize } from '../middlewares/authorize';
import { createUserSchema, updateUserSchema } from '../validations/user.validation';
import { updatePasswordByAdminSchema, updateMyPasswordSchema } from '../validations/auth.validation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: المستخدمون (Users)
 *   description: إدارة مستخدمي النظام (للمدير فقط)
 */

// Protect all user routes
router.use(passport.authenticate('jwt', { session: false }));

/**
 * @swagger
 * /users:
 *   get:
 *     summary: جلب جميع المستخدمين
 *     tags: [المستخدمون (Users)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: قائمة بجميع المستخدمين.
 *       403:
 *         description: غير مصرح به.
 */
router.get('/', authorize(['user:read']), userController.getAllUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: جلب مستخدم معين بواسطة ID
 *     tags: [المستخدمون (Users)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID المستخدم
 *     responses:
 *       200:
 *         description: بيانات المستخدم.
 *       404:
 *         description: المستخدم غير موجود.
 *       403:
 *         description: غير مصرح به.
 */
router.get('/:id', authorize(['user:read']), userController.getUserById);

/**
 * @swagger
 * /users/me/password:
 *   patch:
 *     summary: تحديث كلمة مرور المستخدم الحالي
 *     tags: [المستخدمون (Users)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - newPasswordConfirmation
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *               newPasswordConfirmation:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: تم تحديث كلمة المرور بنجاح.
 *       400:
 *         description: خطأ في المدخلات أو كلمة المرور الحالية غير صحيحة.
 *       401:
 *         description: غير مصرح به.
 */
router.patch(
  '/me/password',
  validate(updateMyPasswordSchema),
  userController.updateMyPassword
);

/**
 * @swagger
 * /users:
 *   post:
 *     summary: إنشاء مستخدم جديد (للمدير فقط)
 *     tags: [المستخدمون (Users)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserInput'
 *     responses:
 *       201:
 *         description: تم إنشاء المستخدم بنجاح.
 *       403:
 *         description: غير مصرح به.
 */
router.post('/', authorize(['user:create']), validate(createUserSchema), userController.createUser);

/**
 * @swagger
 * /users/{id}/password:
 *   patch:
 *     summary: تحديث كلمة مرور مستخدم بواسطة المدير
 *     tags: [المستخدمون (Users)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID المستخدم
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *               - passwordConfirmation
 *             properties:
 *               password:
 *                 type: string
 *                 format: password
 *               passwordConfirmation:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: تم تحديث كلمة المرور بنجاح.
 *       400:
 *         description: خطأ في المدخلات أو عدم تطابق كلمات المرور.
 *       403:
 *         description: غير مصرح به.
 *       404:
 *         description: المستخدم غير موجود.
 */
router.patch(
  '/:id/password',
  authorize(['user:update']),
  validate(updatePasswordByAdminSchema),
  userController.updateUserPassword
);

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     summary: تحديث بيانات مستخدم
 *     tags: [المستخدمون (Users)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID المستخدم
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserInput'
 *     responses:
 *       200:
 *         description: تم تحديث المستخدم بنجاح.
 *       404:
 *         description: المستخدم غير موجود.
 *       403:
 *         description: غير مصرح به.
 */
router.patch('/:id', authorize(['user:update']), validate(updateUserSchema), userController.updateUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: حذف مستخدم
 *     tags: [المستخدمون (Users)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID المستخدم
 *     responses:
 *       200:
 *         description: تم حذف المستخدم بنجاح.
 *       404:
 *         description: المستخدم غير موجود.
 *       403:
 *         description: غير مصرح به.
 */
router.delete('/:id', authorize(['user:delete']), userController.deleteUser);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateUserInput:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *         role:
 *           type: string
 *           description: ID الدور (اختياري، سيتم تعيين دور 'user' افتراضيًا)
 *     UpdateUserInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           type: string
 *           description: ID الدور الجديد
 *         hourlyRate:
 *           type: number
 *           description: سعر الساعة للمستخدم
 */
