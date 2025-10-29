
import { z } from 'zod';
import i18next from '../config/i18n.config'; // Import i18next for translations

const passwordValidation = z
  .string()
  .min(8, i18next.t('validation:password_min'))
  .regex(/[A-Z]/, i18next.t('validation:password_uppercase'))
  .regex(/[a-z]/, i18next.t('validation:password_lowercase'))
  .regex(/[0-9]/, i18next.t('validation:password_number'))
  .regex(/[^A-Za-z0-9]/, i18next.t('validation:password_special'));

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(3, i18next.t('validation:name_min')),
    email: z.string().email(i18next.t('validation:invalid_email')),
    password: passwordValidation,
    role: z.string().regex(/^[0-9a-fA-F]{24}$/, i18next.t('validation:invalid_role_id')).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(i18next.t('validation:invalid_email')),
    password: z.string(), // No strict validation on login
  }),
});

export const clientRegisterSchema = z.object({
  body: z.object({
    name: z.string().min(3, i18next.t('validation:name_min')),
    email: z.string().email(i18next.t('validation:invalid_email')),
    password: passwordValidation,
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    token: z.string(),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(i18next.t('validation:invalid_email')),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    password: passwordValidation,
    passwordConfirmation: z.string(),
  }).refine((data) => data.password === data.passwordConfirmation, {
    message: i18next.t('validation:passwords_do_not_match'),
    path: ['passwordConfirmation'], // Point error to the confirmation field
  }),
  params: z.object({
    token: z.string().min(1, i18next.t('validation:token_required')),
  }),
});

export const updatePasswordByAdminSchema = z.object({
  body: z.object({
    password: passwordValidation,
    passwordConfirmation: z.string(),
  }).refine((data) => data.password === data.passwordConfirmation, {
    message: i18next.t('validation:passwords_do_not_match'),
    path: ['passwordConfirmation'],
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, i18next.t('validation:invalid_user_id')),
  }),
});

export const updateMyPasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string(),
    newPassword: passwordValidation,
    newPasswordConfirmation: z.string(),
  }).refine((data) => data.newPassword === data.newPasswordConfirmation, {
    message: i18next.t('validation:passwords_do_not_match'),
    path: ['newPasswordConfirmation'],
  }),
});
