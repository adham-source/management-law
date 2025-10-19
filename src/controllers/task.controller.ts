import { Request, Response } from 'express';
import { IUser } from '../models/User.model';
import asyncHandler from '../utils/asyncHandler';
import * as taskService from '../services/task.service';
import { logActivity } from '../services/audit.service';
import { buildFilter, buildSort, buildPagination } from '../utils/query.utils';

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  const user = req.user as IUser;
  const task = await taskService.createTask(req.body, user._id);
  await logActivity({ user: user._id, action: 'CREATE_TASK', targetResourceId: task._id, ipAddress: req.ip });
  res.status(201).json(task);
});

export const getTasks = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    const user = req.user as IUser;
    const filter = buildFilter(req.query, ['status', 'priority', 'category', 'assignedTo']);
    const sort = buildSort(req.query);
    const { limit, skip } = buildPagination(req.query);
    const tasks = await taskService.getTasks({ ...filter }, user, sort, limit, skip);
    res.status(200).json(tasks);
});

export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    const user = req.user as IUser;
    const task = await taskService.findTaskById(req.params.id, user);
    if (!task) {
        return res.status(404).json({ message: 'Task not found or unauthorized' });
    }
    res.status(200).json(task);
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    const user = req.user as IUser;
    const task = await taskService.updateTask(req.params.id, req.body, user);
    if (!task) {
        return res.status(404).json({ message: 'Task not found or unauthorized' });
    }
    await logActivity({ user: user._id, action: 'UPDATE_TASK', targetResourceId: task._id, ipAddress: req.ip });
    res.status(200).json(task);
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    const user = req.user as IUser;
    const task = await taskService.deleteTask(req.params.id, user);
    if (!task) {
        return res.status(404).json({ message: 'Task not found or unauthorized' });
    }
    await logActivity({ user: user._id, action: 'DELETE_TASK', targetResourceId: task._id, ipAddress: req.ip });
    res.status(200).json({ message: 'Task deleted successfully' });
});

export const logHoursOnTask = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    const user = req.user as IUser;
    const { id } = req.params;
    const { hours } = req.body;
    const task = await taskService.logHoursAndCalculateCost(id, hours, user);
    if (!task) {
        return res.status(404).json({ message: 'Task not found or unauthorized' });
    }
    await logActivity({ user: user._id, action: 'LOG_HOURS_TASK', targetResourceId: task._id, details: { hours }, ipAddress: req.ip });
    res.status(200).json(task);
});