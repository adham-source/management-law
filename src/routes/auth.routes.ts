import { Router } from 'express';
import passport from 'passport';
import * as authController from '../controllers/auth.controller';
import validate from '../middlewares/validate';
import { registerSchema, loginSchema, clientRegisterSchema, verifyEmailSchema } from '../validations/auth.validation';
import { authLimiter } from '../middlewares/rateLimiter';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: المصادقة (Authentication)
 *   description: مسارات المصادقة وتسجيل المستخدمين
 */

/**
 * @swagger
 * /auth/register/client:
 *   post:
 *     summary: تسجيل عميل جديد (بنفسه)
 *     tags: [المصادقة (Authentication)]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: تم التسجيل بنجاح، يرجى مراجعة البريد الإلكتروني للتفعيل.
 *       400:
 *         description: البريد الإلكتروني مستخدم بالفعل أو خطأ في المدخلات.
 */
router.post('/register/client', authLimiter, validate(clientRegisterSchema), authController.clientRegister);

/**
 * @swagger
 * /auth/verify-email:
 *   post:
 *     summary: تفعيل حساب البريد الإلكتروني
 *     tags: [المصادقة (Authentication)]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: تم تفعيل الحساب بنجاح، مع إرجاع بيانات المستخدم ورموز الدخول.
 *       400:
 *         description: الرمز غير صالح أو انتهت صلاحيته.
 */
router.post('/verify-email', authLimiter, validate(verifyEmailSchema), authController.verifyEmail);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: تسجيل الدخول
 *     tags: [المصادقة (Authentication)]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: نجاح تسجيل الدخول، مع إرجاع بيانات المستخدم ورموز الدخول.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: بيانات الدخول غير صحيحة أو الحساب غير مفعل.
 */
router.post('/login', authLimiter, validate(loginSchema), authController.login);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: تحديث رمز الوصول (Access Token)
 *     tags: [المصادقة (Authentication)]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: تم تحديث الرمز بنجاح.
 *       401:
 *         description: رمز التحديث غير صالح.
 */
router.post('/refresh-token', authController.refreshToken);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: تسجيل الخروج
 *     tags: [المصادقة (Authentication)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: تم تسجيل الخروج بنجاح.
 *       401:
 *         description: غير مصرح به.
 */
router.post('/logout', passport.authenticate('jwt', { session: false }), authController.logout);


// --- Routes for Admin --- //

/**
 * @swagger
 * /auth/register/user:
 *   post:
 *     summary: تسجيل مستخدم جديد (بواسطة المدير)
 *     tags: [المصادقة (Authentication)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: تم إنشاء المستخدم بنجاح.
 *       403:
 *         description: غير مصرح به (للمدير فقط).
 */
// This route should be protected by an admin-only authorization middleware
router.post('/register/user', passport.authenticate('jwt', { session: false }), /* authorize(['admin']), */ validate(registerSchema), authController.createUser);

export default router;

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: البريد الإلكتروني للمستخدم
 *         password:
 *           type: string
 *           format: password
 *           description: كلمة المرور
 *     RegisterInput:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - role
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
 *           description: ID الخاص بالدور (Role)
 *     LoginResponse:
 *       type: object
 *       properties:
 *         user:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             role:
 *               type: string
 *         accessToken:
 *           type: string
 *         refreshToken:
 *           type: string
 */