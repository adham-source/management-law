
import { z } from 'zod';
import { caseTypes, caseStatuses } from '../models/Case.model';

const opponentSchema = z.object({
  name: z.string(),
  lawyer: z.string().optional(),
});

const timelineEventSchema = z.object({
  date: z.string().datetime(),
  description: z.string(),
  createdBy: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID'),
});

export const createCaseSchema = z.object({
  body: z.object({
    caseNumber: z.string().min(1, 'Case number is required'),
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().optional(),
    caseType: z.enum(caseTypes as [string, ...string[]]),
    status: z.enum(caseStatuses as [string, ...string[]]).optional(),
    court: z.string().optional(),
    clients: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid client ID')).min(1, 'At least one client is required'),
    assignedLawyers: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid lawyer ID')).min(1, 'At least one lawyer is required'),
    openingDate: z.string().datetime().optional(),
    closingDate: z.string().datetime().optional(),
    opponents: z.array(opponentSchema).optional(),
    timeline: z.array(timelineEventSchema).optional(),
  }),
});

export const updateCaseSchema = z.object({
  body: z.object({
    caseNumber: z.string().min(1).optional(),
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    caseType: z.enum(caseTypes as [string, ...string[]]).optional(),
    status: z.enum(caseStatuses as [string, ...string[]]).optional(),
    court: z.string().optional(),
    clients: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid client ID')).min(1).optional(),
    assignedLawyers: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid lawyer ID')).min(1).optional(),
    openingDate: z.string().datetime().optional(),
    closingDate: z.string().datetime().optional(),
    opponents: z.array(opponentSchema).optional(),
    timeline: z.array(timelineEventSchema).optional(),
  }),
});
