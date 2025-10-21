
import { Request, Response } from 'express';
import { IUser } from '../models/User.model';
import asyncHandler from '../utils/asyncHandler';
import * as clientService from '../services/client.service';
import { logActivity } from '../services/audit.service';
import { buildFilter, buildSort, buildPagination } from '../utils/query.utils';

export const createClient = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  const user = req.user as IUser;
  const client = await clientService.createClient(req.body, user);
  await logActivity({ user: user._id, action: 'CREATE_CLIENT', targetResourceId: client._id, ipAddress: req.ip });
  res.status(201).json(client);
});

export const getClients = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  const user = req.user as IUser;
  const filter = buildFilter(req.query, ['name', 'nationalId', 'email', 'clientType']);
  const sort = buildSort(req.query);
  const { limit, skip } = buildPagination(req.query);
  const clients = await clientService.getAllClients(user, filter, sort, limit, skip);
  res.status(200).json(clients);
});

export const getClientById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  const user = req.user as IUser;
  const client = await clientService.getClientById(req.params.id, user);
  if (!client) {
    return res.status(404).json({ message: 'Client not found or not authorized' });
  }
  res.status(200).json(client);
});

export const updateClient = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  const user = req.user as IUser;
  const client = await clientService.updateClient(req.params.id, req.body, user);
  if (!client) {
    return res.status(404).json({ message: 'Client not found or not authorized' });
  }
  await logActivity({ user: user._id, action: 'UPDATE_CLIENT', targetResourceId: client._id, ipAddress: req.ip });
  res.status(200).json(client);
});

export const deleteClient = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  const user = req.user as IUser;
  const client = await clientService.deleteClient(req.params.id, user);
  if (!client) {
    return res.status(404).json({ message: 'Client not found or not authorized' });
  }
  await logActivity({ user: user._id, action: 'DELETE_CLIENT', targetResourceId: client._id, ipAddress: req.ip });
  res.status(200).json({ message: 'Client deleted successfully' });
});
