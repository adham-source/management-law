
import { z } from 'zod';
import i18next from '../config/i18n.config';

export const createPermissionSchema = z.object({
  body: z.object({
    name: z.string().min(3, i18next.t('validation:permission_name_min')),
    description: z.string().optional(),
  }),
});

export const updatePermissionSchema = z.object({
  body: z.object({
    name: z.string().min(3, i18next.t('validation:permission_name_min')).optional(),
    description: z.string().optional(),
  }).partial(),
});
