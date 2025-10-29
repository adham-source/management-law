import { z } from 'zod';
import { taskStatuses, taskPriorities, taskCategories } from '../models/Task.model';
import i18next from '../config/i18n.config';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, i18next.t('validation:invalid_id'));

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(3, i18next.t('validation:title_min')),
    description: z.string().optional(),
    assignedTo: objectIdSchema,
    relatedCase: objectIdSchema.optional(),
    relatedClient: objectIdSchema.optional(),
    dueDate: z.string().datetime().optional(),
    status: z.enum(taskStatuses as [string, ...string[]]).optional(),
    priority: z.enum(taskPriorities as [string, ...string[]]).optional(),
    category: z.enum(taskCategories as [string, ...string[]]),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    assignedTo: objectIdSchema.optional(),
    relatedCase: objectIdSchema.optional(),
    relatedClient: objectIdSchema.optional(),
    dueDate: z.string().datetime().optional(),
    status: z.enum(taskStatuses as [string, ...string[]]).optional(),
    priority: z.enum(taskPriorities as [string, ...string[]]).optional(),
    category: z.enum(taskCategories as [string, ...string[]]).optional(),
  }),
});

export const logHoursSchema = z.object({
    body: z.object({
        hours: z.number().positive(i18next.t('validation:hours_positive')),
    }),
});