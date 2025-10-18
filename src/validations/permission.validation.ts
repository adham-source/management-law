
import { z } from 'zod';

export const createPermissionSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Permission name must be at least 3 characters'),
    description: z.string().optional(),
  }),
});

export const updatePermissionSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Permission name must be at least 3 characters').optional(),
    description: z.string().optional(),
  }).partial(),
});
