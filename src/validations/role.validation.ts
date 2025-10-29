
import { z } from 'zod';
import i18next from '../config/i18n.config';

export const createRoleSchema = z.object({
  body: z.object({
    name: z.string().min(3, i18next.t('validation:role_name_min')),
    permissions: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, i18next.t('validation:invalid_permission_id'))).optional(),
  }),
});

export const updateRoleSchema = z.object({
  body: z.object({
    name: z.string().min(3, i18next.t('validation:role_name_min')).optional(),
    permissions: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, i18next.t('validation:invalid_permission_id'))).optional(),
  }).partial(),
});
