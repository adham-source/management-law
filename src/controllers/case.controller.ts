
import { Request, Response } from 'express';
import { IUser } from '../models/User.model';
import asyncHandler from '../utils/asyncHandler';
import * as caseService from '../services/case.service';
import { logActivity } from '../services/audit.service';
import { buildFilter, buildSort, buildPagination } from '../utils/query.utils';

export const createCase = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  const user = req.user as IUser;
  const caseItem = await caseService.createCase(req.body, user._id);
  await logActivity({ user: user._id, action: 'CREATE_CASE', targetResourceId: caseItem._id, ipAddress: req.ip });
  res.status(201).json(caseItem);
});

export const getCases = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  const user = req.user as IUser;
  const filter = buildFilter(req.query, ['caseNumber', 'title', 'caseType', 'status', 'court']);
  const sort = buildSort(req.query);
  const { limit, skip } = buildPagination(req.query);
  const cases = await caseService.getAllCases(user, filter, sort, limit, skip);
  res.status(200).json(cases);
});

export const getCaseById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  const user = req.user as IUser;
  const caseItem = await caseService.getCaseById(req.params.id, user);
  if (!caseItem) {
    return res.status(404).json({ message: 'Case not found' });
  }
  res.status(200).json(caseItem);
});

export const updateCase = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  const user = req.user as IUser;
  const caseItem = await caseService.updateCase(req.params.id, req.body, user);
  if (!caseItem) {
    return res.status(404).json({ message: 'Case not found or not authorized' });
  }
  await logActivity({ user: user._id, action: 'UPDATE_CASE', targetResourceId: caseItem._id, ipAddress: req.ip });
  res.status(200).json(caseItem);
});

export const deleteCase = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  const user = req.user as IUser;
  const caseItem = await caseService.deleteCase(req.params.id, user);
  if (!caseItem) {
    return res.status(404).json({ message: 'Case not found or not authorized' });
  }
  await logActivity({ user: user._id, action: 'DELETE_CASE', targetResourceId: caseItem._id, ipAddress: req.ip });
  res.status(200).json({ message: 'Case deleted successfully' });
});
