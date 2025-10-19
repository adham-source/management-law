
import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import * as auditService from '../services/audit.service';
import { buildFilter, buildSort, buildPagination } from '../utils/query.utils';

export const getLogs = asyncHandler(async (req: Request, res: Response) => {
    const filter = buildFilter(req.query, ['user', 'action', 'targetResource']);
    const sort = buildSort(req.query);
    const { limit, skip } = buildPagination(req.query);

    const logs = await auditService.getAuditLogs(filter, sort, limit, skip);
    res.status(200).json(logs);
});
