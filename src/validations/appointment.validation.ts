
import { z } from 'zod';
import i18next from '../config/i18n.config';

const appointmentBody = z.object({
  title: z.string().min(3, i18next.t('validation:title_min')),
  description: z.string().optional(),
  startTime: z.string().datetime(i18next.t('validation:invalid_datetime')),
  endTime: z.string().datetime(i18next.t('validation:invalid_datetime')),
  attendees: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, i18next.t('validation:invalid_user_id'))).optional(),
  relatedCase: z.string().regex(/^[0-9a-fA-F]{24}$/, i18next.t('validation:invalid_case_id')).optional(),
  location: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'canceled', 'rescheduled']).optional(),
}).refine((data) => new Date(data.endTime) > new Date(data.startTime), {
  message: i18next.t('validation:end_time_after_start_time'),
  path: ['endTime'], // path of error
});

export const createAppointmentSchema = z.object({
  body: appointmentBody,
});

export const updateAppointmentSchema = z.object({
  body: appointmentBody.partial(), // All fields are optional on update
});
