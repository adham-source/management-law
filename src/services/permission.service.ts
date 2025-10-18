
import Permission, { IPermission } from '../models/Permission.model';
import { z } from 'zod';
import { createPermissionSchema, updatePermissionSchema } from '../validations/permission.validation';
import mongoose from 'mongoose';

// Create Permission Service
export const createPermission = async (
  input: z.infer<typeof createPermissionSchema>['body']
): Promise<IPermission> => {
  const permissionExists = await Permission.findOne({ name: input.name });
  if (permissionExists) {
    throw new Error('Permission with this name already exists');
  }
  return Permission.create(input);
};

// Get All Permissions Service
export const getAllPermissions = async (): Promise<IPermission[]> => {
  return Permission.find().sort({ name: 1 });
};

// Get Permission By ID Service
export const getPermissionById = async (permissionId: string): Promise<IPermission | null> => {
  return Permission.findById(permissionId);
};

// Update Permission Service
export const updatePermission = async (
  permissionId: string,
  update: z.infer<typeof updatePermissionSchema>['body']
): Promise<IPermission | null> => {
  return Permission.findByIdAndUpdate(permissionId, update, { new: true });
};

// Delete Permission Service
export const deletePermission = async (permissionId: string): Promise<IPermission | null> => {
  return Permission.findByIdAndDelete(permissionId);
};
