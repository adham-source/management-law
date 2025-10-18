import { Router } from 'express';
import passport from 'passport';
import * as permissionController from '../controllers/permission.controller';
import validate from '../middlewares/validate';
import { authorize } from '../middlewares/authorize';
import { createPermissionSchema, updatePermissionSchema } from '../validations/permission.validation';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: الصلاحيات (Permissions)
 *   description: إدارة صلاحيات النظام (للمدير فقط)
 */

// Protect all permission routes
router.use(passport.authenticate('jwt', { session: false }));
router.use(authorize(['permission:manage']));

/**
 * @swagger
 * /permissions:
 *   get:
 *     summary: جلب جميع الصلاحيات المتاحة
 *     tags: [الصلاحيات (Permissions)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: قائمة بجميع الصلاحيات.
 */
router.get('/', permissionController.getAllPermissions);

/**
 * @swagger
 * /permissions:
 *   post:
 *     summary: إنشاء صلاحية جديدة (غير مستحسن، يتم إنشاؤها من seed)
 *     tags: [الصلاحيات (Permissions)]
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
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: تم إنشاء الصلاحية بنجاح.
 */
router.post('/', validate(createPermissionSchema), permissionController.createPermission);

export default router;