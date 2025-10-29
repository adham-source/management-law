
import { z } from 'zod';
import { caseTypes, caseStatuses } from '../models/Case.model';
import i18next from '../config/i18n.config';

const opponentSchema = z.object({
  name: z.string(),
  lawyer: z.string().optional(),
});

const timelineEventSchema = z.object({
  date: z.string().datetime(),
  description: z.string(),
  createdBy: z.string().regex(/^[0-9a-fA-F]{24}$/, i18next.t('validation:invalid_user_id')),
});

export const createCaseSchema = z.object({
  body: z.object({
    caseNumber: z.string().min(1, i18next.t('validation:case_number_required')),
    title: z.string().min(3, i18next.t('validation:title_min')),
    description: z.string().optional(),
    caseType: z.enum(caseTypes as [string, ...string[]]),
    status: z.enum(caseStatuses as [string, ...string[]]).optional(),
    court: z.string().optional(),
    clients: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, i18next.t('validation:invalid_client_id'))).min(1, i18next.t('validation:at_least_one_client')),
    assignedLawyers: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, i18next.t('validation:invalid_lawyer_id'))).min(1, i18next.t('validation:at_least_one_lawyer')),
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
    clients: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, i18next.t('validation:invalid_client_id'))).min(1).optional(),
    assignedLawyers: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, i18next.t('validation:invalid_lawyer_id'))).min(1).optional(),
    openingDate: z.string().datetime().optional(),
    closingDate: z.string().datetime().optional(),
    opponents: z.array(opponentSchema).optional(),
    timeline: z.array(timelineEventSchema).optional(),
  }),
});
