
import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import * as appointmentService from '../services/appointment.service';
import { buildFilter, buildSort, buildPagination } from '../utils/query.utils';

export const createAppointment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  const appointment = await appointmentService.createAppointment(req.body, req.user._id);
  res.status(201).json(appointment);
});

export const getAppointments = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  const filter = buildFilter(req.query, ['title', 'description', 'location']);
  const sort = buildSort(req.query);
  const { limit, skip } = buildPagination(req.query);
  const appointments = await appointmentService.getAppointments(req.user._id, filter, sort, limit, skip);
  res.status(200).json(appointments);
});

export const getAppointmentById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  const appointment = await appointmentService.getAppointmentById(req.params.id, req.user._id);
  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }
  res.status(200).json(appointment);
});

export const updateAppointment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  const appointment = await appointmentService.updateAppointment(req.params.id, req.body, req.user._id);
  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }
  res.status(200).json(appointment);
});

export const deleteAppointment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  const appointment = await appointmentService.deleteAppointment(req.params.id, req.user._id);
  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }
  res.status(200).json({ message: 'Appointment deleted successfully' });
});
