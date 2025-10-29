
import User, { IUser } from '../models/User.model';
import Role, { IRole } from '../models/Role.model';
import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose';
import AppError from '../utils/AppError';
import * as auditService from './audit.service';
import mongoose from 'mongoose';
import { sendPasswordChangedNotificationEmail } from '../services/email.service';
import { validateObjectId } from '../utils/validation.utils';

export const findUser = async (query: FilterQuery<IUser>) => {
  return await User.findOne(query);
};

export const findUserById = async (id: string) => {
  return await User.findById(id).populate('role');
};

export const createUser = async (input: Partial<IUser>) => {
  // Initialize roleIdentifier with the full possible type of input.role
  let roleIdentifier: mongoose.Types.ObjectId | string | IRole | undefined = input.role;

  // If roleIdentifier is an object (meaning it's an IRole), extract its _id
  if (typeof roleIdentifier === 'object' && roleIdentifier !== null && '_id' in roleIdentifier) {
    roleIdentifier = (roleIdentifier as IRole)._id;
  }
  // After this 'if' block, roleIdentifier will be either ObjectId | string | undefined

  if (roleIdentifier) { // Now roleIdentifier is definitely not IRole object, but could be ObjectId | string
    validateObjectId(roleIdentifier, 'errors:invalid_role_id', 400);
    const foundRole = await Role.findById(roleIdentifier);
    if (!foundRole) {
      throw new AppError('errors:role_not_found', 404);
    }
    input.role = foundRole._id;
    return await User.create(input);
  }

  const clientRole = await Role.findOne({ name: 'client' });
  if (!clientRole) {
    throw new AppError('errors:default_client_role_not_found', 500);
  }
  input.role = clientRole._id;
  return await User.create(input);
};
  

export const updateUser = async (
  query: FilterQuery<IUser>,
  update: UpdateQuery<IUser>,
  options: QueryOptions
) => {
  return await User.findOneAndUpdate(query, update, options);
};

export const deleteUser = async (query: FilterQuery<IUser>) => {
  return await User.deleteOne(query);
};

export const getAllUsers = async () => {
    return await User.find().populate('role');
  };
  
export const updateUserPasswordByAdmin = async (userId: string, newPassword: string, adminId: string) => {
  const user = await User.findById(userId).select('+password'); // Select password to ensure pre-save hook runs

  if (!user) {
    throw new AppError('errors:user_not_found', 404);
  }

  user.password = newPassword;
  await user.save(); // Pre-save hook will hash the new password and update passwordChangedAt

  // Audit logging
  await auditService.logActivity({
    user: new mongoose.Types.ObjectId(adminId),
    action: 'PASSWORD_CHANGE_BY_ADMIN',
    targetResource: 'User',
    targetResourceId: user._id,
    details: { changedUserEmail: user.email },
  });

  // Send password changed notification email
  const adminUser = await User.findById(adminId);
  const initiatorName = adminUser ? `المسؤول ${adminUser.name}` : 'مسؤول غير معروف';
  await sendPasswordChangedNotificationEmail(user, initiatorName);

  return { messageKey: 'common:password_updated_successfully' };
};

export const updateMyPassword = async (userId: string, currentPassword: string, newPassword: string) => {
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new AppError('errors:user_not_found', 404);
  }

  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError('errors:invalid_current_password', 401);
  }

  user.password = newPassword;
  await user.save(); // Pre-save hook will hash the new password and update passwordChangedAt and tokenVersion

  // Audit logging
  await auditService.logActivity({
    user: new mongoose.Types.ObjectId(userId),
    action: 'PASSWORD_CHANGE_SELF',
    targetResource: 'User',
    targetResourceId: user._id,
    details: { changedUserEmail: user.email },
  });

  // Send password changed notification email
  await sendPasswordChangedNotificationEmail(user, 'أنت'); // Initiated by the user themselves

  return { messageKey: 'common:password_updated_successfully' };
};
