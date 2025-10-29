
import { z } from 'zod';
import i18next from '../config/i18n.config';

export const createUserSchema = z.object({
  name: z.string().min(1, i18next.t('validation:name_required')),
  email: z.string().email(i18next.t('validation:invalid_email')),
  password: z.string().min(6, i18next.t('validation:password_min')),
  role: z.string().optional(), // Role assignment should be handled by admin
});

export const updateUserSchema = z.object({
  name: z.string().min(1, i18next.t('validation:name_required')).optional(),
  email: z.string().email(i18next.t('validation:invalid_email')).optional(),
  role: z.string().optional(), // Role assignment should be handled by admin
  hourlyRate: z.number().positive(i18next.t('validation:amount_positive')).optional(),
});
