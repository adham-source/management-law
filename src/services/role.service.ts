
import Role, { IRole } from '../models/Role.model';
import { z } from 'zod';
import { createRoleSchema, updateRoleSchema } from '../validations/role.validation';
import mongoose from 'mongoose';

// Create Role Service
export const createRole = async (
  input: z.infer<typeof createRoleSchema>['body']
): Promise<IRole> => {
  const roleExists = await Role.findOne({ name: input.name });
  if (roleExists) {
    throw new Error('Role with this name already exists');
  }
  return Role.create(input);
};

// Get All Roles Service
export const getAllRoles = async (): Promise<IRole[]> => {
  return Role.find().populate('permissions', 'name').sort({ name: 1 });
};

// Get Role By ID Service
export const getRoleById = async (roleId: string): Promise<IRole | null> => {
  return Role.findById(roleId).populate('permissions', 'name');
};

// Update Role Service
export const updateRole = async (
  roleId: string,
  update: z.infer<typeof updateRoleSchema>['body']
): Promise<IRole | null> => {
  return Role.findByIdAndUpdate(roleId, update, { new: true });
};

// Delete Role Service
export const deleteRole = async (roleId: string): Promise<IRole | null> => {
  return Role.findByIdAndDelete(roleId);
};
