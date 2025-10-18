
import Appointment, { IAppointment } from '../models/Appointment.model';
import { z } from 'zod';
import { createAppointmentSchema, updateAppointmentSchema } from '../validations/appointment.validation';
import mongoose from 'mongoose';

// Create Appointment Service
export const createAppointment = async (
  input: z.infer<typeof createAppointmentSchema>['body'],
  userId: mongoose.Types.ObjectId
): Promise<IAppointment> => {
  const appointmentData = { ...input, createdBy: userId };
  return Appointment.create(appointmentData);
};

// Get Appointments Service (e.g., for a specific user within a date range)
export const getAppointments = async (
  userId: mongoose.Types.ObjectId,
  filter: any,
  sort: any,
  limit: number,
  skip: number
): Promise<IAppointment[]> => {
  const baseQuery: any = {
    $or: [{ createdBy: userId }, { attendees: userId }],
  };

  return Appointment.find({ ...baseQuery, ...filter })
    .populate('attendees', 'name email')
    .populate('relatedCase', 'caseNumber title')
    .sort(sort)
    .limit(limit)
    .skip(skip);
};

// Get Appointment By ID Service
export const getAppointmentById = async (
  appointmentId: string,
  userId: mongoose.Types.ObjectId
): Promise<IAppointment | null> => {
  return Appointment.findOne({ _id: appointmentId, $or: [{ createdBy: userId }, { attendees: userId }] });
};

// Update Appointment Service
export const updateAppointment = async (
  appointmentId: string,
  update: z.infer<typeof updateAppointmentSchema>['body'],
  userId: mongoose.Types.ObjectId
): Promise<IAppointment | null> => {
  return Appointment.findOneAndUpdate({ _id: appointmentId, createdBy: userId }, update, { new: true });
};

// Delete Appointment Service
export const deleteAppointment = async (
  appointmentId: string,
  userId: mongoose.Types.ObjectId
): Promise<IAppointment | null> => {
  return Appointment.findOneAndDelete({ _id: appointmentId, createdBy: userId });
};
