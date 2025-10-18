
import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import * as caseService from '../services/case.service';
import { buildFilter, buildSort, buildPagination } from '../utils/query.utils';

export const createCase = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  const caseItem = await caseService.createCase(req.body, req.user._id);
  res.status(201).json(caseItem);
});

export const getCases = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  const filter = buildFilter(req.query, ['caseNumber', 'title', 'caseType', 'status', 'court']);
  const sort = buildSort(req.query);
  const { limit, skip } = buildPagination(req.query);
  const cases = await caseService.getAllCases(req.user, filter, sort, limit, skip);
  res.status(200).json(cases);
});

export const getCaseById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  const caseItem = await caseService.getCaseById(req.params.id, req.user);
  if (!caseItem) {
    return res.status(404).json({ message: 'Case not found' });
  }
  res.status(200).json(caseItem);
});

export const updateCase = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  const caseItem = await caseService.updateCase(req.params.id, req.body, req.user._id);
  if (!caseItem) {
    return res.status(404).json({ message: 'Case not found' });
  }
  res.status(200).json(caseItem);
});

export const deleteCase = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  const caseItem = await caseService.deleteCase(req.params.id, req.user._id);
  if (!caseItem) {
    return res.status(404).json({ message: 'Case not found' });
  }
  res.status(200).json({ message: 'Case deleted successfully' });
});
