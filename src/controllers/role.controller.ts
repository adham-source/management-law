
import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import * as roleService from '../services/role.service';

export const createRole = asyncHandler(async (req: Request, res: Response) => {
  const role = await roleService.createRole(req.body);
  res.status(201).json(role);
});

export const getAllRoles = asyncHandler(async (req: Request, res: Response) => {
  const roles = await roleService.getAllRoles();
  res.status(200).json(roles);
});

export const getRoleById = asyncHandler(async (req: Request, res: Response) => {
  const role = await roleService.getRoleById(req.params.id);
  if (!role) {
    return res.status(404).json({ message: 'Role not found' });
  }
  res.status(200).json(role);
});

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const role = await roleService.updateRole(req.params.id, req.body);
  if (!role) {
    return res.status(404).json({ message: 'Role not found' });
  }
  res.status(200).json(role);
});

export const deleteRole = asyncHandler(async (req: Request, res: Response) => {
  const role = await roleService.deleteRole(req.params.id);
  if (!role) {
    return res.status(404).json({ message: 'Role not found' });
  }
  res.status(200).json({ message: 'Role deleted successfully' });
});
