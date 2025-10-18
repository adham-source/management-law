
import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import * as permissionService from '../services/permission.service';

export const createPermission = asyncHandler(async (req: Request, res: Response) => {
  const permission = await permissionService.createPermission(req.body);
  res.status(201).json(permission);
});

export const getAllPermissions = asyncHandler(async (req: Request, res: Response) => {
  const permissions = await permissionService.getAllPermissions();
  res.status(200).json(permissions);
});

export const getPermissionById = asyncHandler(async (req: Request, res: Response) => {
  const permission = await permissionService.getPermissionById(req.params.id);
  if (!permission) {
    return res.status(404).json({ message: 'Permission not found' });
  }
  res.status(200).json(permission);
});

export const updatePermission = asyncHandler(async (req: Request, res: Response) => {
  const permission = await permissionService.updatePermission(req.params.id, req.body);
  if (!permission) {
    return res.status(404).json({ message: 'Permission not found' });
  }
  res.status(200).json(permission);
});

export const deletePermission = asyncHandler(async (req: Request, res: Response) => {
  const permission = await permissionService.deletePermission(req.params.id);
  if (!permission) {
    return res.status(404).json({ message: 'Permission not found' });
  }
  res.status(200).json({ message: 'Permission deleted successfully' });
});
