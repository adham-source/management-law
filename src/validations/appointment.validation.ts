
import { z } from 'zod';

const appointmentBody = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  startTime: z.string().datetime('Invalid start time format'),
  endTime: z.string().datetime('Invalid end time format'),
  attendees: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID')).optional(),
  relatedCase: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid case ID').optional(),
  location: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'canceled', 'rescheduled']).optional(),
}).refine((data) => new Date(data.endTime) > new Date(data.startTime), {
  message: 'End time must be after start time',
  path: ['endTime'], // path of error
});

export const createAppointmentSchema = z.object({
  body: appointmentBody,
});

export const updateAppointmentSchema = z.object({
  body: appointmentBody.partial(), // All fields are optional on update
});
