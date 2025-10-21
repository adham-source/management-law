import { Router } from 'express';
import passport from 'passport';
import * as roleController from '../controllers/role.controller';
import validate from '../middlewares/validate';
import { authorize } from '../middlewares/authorize';
import { createRoleSchema, updateRoleSchema } from '../validations/role.validation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: الأدوار (Roles)
 *   description: إدارة أدوار المستخدمين وصلاحياتهم (للمدير فقط)
 */

// Protect all role routes
router.use(passport.authenticate('jwt', { session: false }));

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: جلب جميع الأدوار
 *     tags: [الأدوار (Roles)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: قائمة بجميع الأدوار.
 */
router.get('/', authorize(['role:read']), roleController.getAllRoles);

/**
 * @swagger
 * /roles/{id}:
 *   get:
 *     summary: جلب دور معين بواسطة ID
 *     tags: [الأدوار (Roles)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID الدور
 *     responses:
 *       200:
 *         description: بيانات الدور.
 *       404:
 *         description: الدور غير موجود.
 */
router.get('/:id', authorize(['role:read']), roleController.getRoleById);

/**
 * @swagger
 * /roles:
 *   post:
 *     summary: إنشاء دور جديد
 *     tags: [الأدوار (Roles)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: ID الصلاحية
 *     responses:
 *       201:
 *         description: تم إنشاء الدور بنجاح.
 */
router.post('/', authorize(['role:create']), validate(createRoleSchema), roleController.createRole);

/**
 * @swagger
 * /roles/{id}:
 *   patch:
 *     summary: تحديث دور معين
 *     tags: [الأدوار (Roles)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID الدور
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: ID الصلاحية
 *     responses:
 *       200:
 *         description: تم تحديث الدور بنجاح.
 *       404:
 *         description: الدور غير موجود.
 */
router.patch('/:id', authorize(['role:update']), validate(updateRoleSchema), roleController.updateRole);

/**
 * @swagger
 * /roles/{id}:
 *   delete:
 *     summary: حذف دور معين
 *     tags: [الأدوار (Roles)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID الدور
 *     responses:
 *       200:
 *         description: تم حذف الدور بنجاح.
 *       404:
 *         description: الدور غير موجود.
 */
router.delete('/:id', authorize(['role:delete']), roleController.deleteRole);

export default router;