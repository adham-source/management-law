import { Router } from 'express';
import * as metadataController from '../controllers/metadata.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: البيانات الوصفية (Metadata)
 *   description: نقاط نهاية توفر بيانات وصفية للنظام (مثل قوائم الخيارات)
 */

/**
 * @swagger
 * /metadata/enums:
 *   get:
 *     summary: جلب جميع قوائم الخيارات (Enums) في النظام
 *     tags: [البيانات الوصفية (Metadata)]
 *     description: | 
 *       يوفر هذا المسار قائمة بجميع الخيارات الثابتة المستخدمة في النظام (مثل أنواع القضايا، حالات المهام، إلخ).
 *       كل خيار يتم إرجاعه مع `value` (القيمة الإنجليزية التي يجب استخدامها عند إرسال البيانات إلى الـ API) 
 *       و `translationKey` (مفتاح الترجمة الذي يمكن استخدامه في الواجهة الأمامية لعرض النص باللغة المناسبة).
 *     responses:
 *       200:
 *         description: كائن يحتوي على جميع قوائم الخيارات.
 */
router.get('/enums', metadataController.getEnums);

export default router;
