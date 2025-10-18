
import { Router } from 'express';
import passport from 'passport';
import * as documentController from '../controllers/document.controller';
import { authorize } from '../middlewares/authorize';
import upload from '../config/multer.config';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: المستندات (Documents)
 *   description: إدارة المستندات والملفات
 */

router.use(passport.authenticate('jwt', { session: false }));

/**
 * @swagger
 * /documents/upload:
 *   post:
 *     summary: رفع مستند جديد
 *     tags: [المستندات (Documents)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               document: 
 *                 type: string
 *                 format: binary
 *               relatedCase: 
 *                 type: string
 *     responses:
 *       201:
 *         description: تم رفع المستند بنجاح.
 */
router.post('/upload', authorize(['document:create']), upload.single('document'), documentController.uploadDocument);

/**
 * @swagger
 * /documents/download/{id}:
 *   get:
 *     summary: تنزيل مستند
 *     tags: [المستندات (Documents)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: ملف المستند.
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/download/:id', authorize(['document:read']), documentController.downloadDocument);

/**
 * @swagger
 * /documents:
 *   get:
 *     summary: جلب قائمة المستندات
 *     tags: [المستندات (Documents)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: قائمة بالمستندات.
 */
router.get('/', authorize(['document:read']), documentController.getDocuments);

/**
 * @swagger
 * /documents/{id}:
 *   delete:
 *     summary: حذف مستند
 *     tags: [المستندات (Documents)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: تم حذف المستند بنجاح.
 */
router.delete('/:id', authorize(['document:delete']), documentController.deleteDocument);

export default router;
