import Appointment, { IAppointment } from '../models/Appointment.model';
import mongoose from 'mongoose';
import * as googleCalendarService from './googleCalendar.service';

// Create Appointment Service
export const createAppointment = async (
  input: Partial<IAppointment>,
  userId: mongoose.Types.ObjectId
): Promise<IAppointment> => {
  const appointmentData = { ...input, createdBy: userId };
  const appointment = await Appointment.create(appointmentData);

  // Integrate with Google Calendar
  try {
    const populatedAppointment = await appointment.populate('attendees', 'email');
    const googleEventId = await googleCalendarService.createCalendarEvent(userId, populatedAppointment);
    if (googleEventId) {
      appointment.googleEventId = googleEventId;
      await appointment.save();
    } else {
      console.warn(`Could not get Google Calendar Event ID for appointment ${appointment._id}`);
    }
  } catch (error) {
    console.error('Failed to create Google Calendar event:', error);
    // We don't throw an error here, the main operation succeeded.
    // Maybe add a flag to the appointment to indicate sync failure.
  }

  return appointment;
};

// Get Appointments Service
export const getAppointments = async (
  userId: mongoose.Types.ObjectId,
  filter: any,
  sort: any,
  limit: number,
  skip: number
): Promise<IAppointment[]> => {
  const baseQuery: any = { $or: [{ createdBy: userId }, { attendees: userId }] };
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
  update: Partial<IAppointment>,
  userId: mongoose.Types.ObjectId
): Promise<IAppointment | null> => {
  const appointment = await Appointment.findOneAndUpdate({ _id: appointmentId, createdBy: userId }, update, { new: true });

  if (appointment && appointment.googleEventId) {
    try {
        const populatedAppointment = await appointment.populate('attendees', 'email');
        await googleCalendarService.updateCalendarEvent(userId, appointment.googleEventId, populatedAppointment);
    } catch (error) {
        console.error('Failed to update Google Calendar event:', error);
    }
  }

  return appointment;
};

// Delete Appointment Service
export const deleteAppointment = async (
  appointmentId: string,
  userId: mongoose.Types.ObjectId
): Promise<IAppointment | null> => {
  const appointment = await Appointment.findOneAndDelete({ _id: appointmentId, createdBy: userId });

  if (appointment && appointment.googleEventId) {
    try {
        await googleCalendarService.deleteCalendarEvent(userId, appointment.googleEventId);
    } catch (error) {
        console.error('Failed to delete Google Calendar event:', error);
    }
  }

  return appointment;
};