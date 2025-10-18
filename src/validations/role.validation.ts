
import { z } from 'zod';

export const createRoleSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Role name must be at least 3 characters'),
    permissions: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Permission ID')).optional(),
  }),
});

export const updateRoleSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Role name must be at least 3 characters').optional(),
    permissions: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Permission ID')).optional(),
  }).partial(),
});
