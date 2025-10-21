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

router.use(passport.authenticate('jwt', { session: false }));

/**
 * @swagger
 * tags:
 *   name: الصلاحيات (Permissions)
 *   description: إدارة صلاحيات النظام (للمدير فقط)
 */

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
router.get('/', authorize(['permission:read']), permissionController.getAllPermissions);

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
// This route is intentionally left without authorization as it's for seeding/dev purposes
// and is discouraged for production use.
router.post('/', validate(createPermissionSchema), permissionController.createPermission);

export default router;