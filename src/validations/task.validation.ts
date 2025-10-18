import { z } from 'zod';
import { taskStatuses, taskPriorities, taskCategories } from '../models/Task.model';

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID');

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
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
        hours: z.number().positive('Hours must be a positive number'),
    }),
});