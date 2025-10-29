
import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import * as userService from '../services/user.service';
import { IUser } from '../models/User.model';
import AppError from '../utils/AppError';

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);
  res.status(201).json(user);
});

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await userService.getAllUsers();
  res.status(200).json(users);
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.findUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: req.t('errors:user_not_found') });
  }
  res.status(200).json(user);
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.updateUser({_id: req.params.id}, req.body, { new: true });
  if (!user) {
    return res.status(404).json({ message: req.t('errors:user_not_found') });
  }
  res.status(200).json(user);
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.deleteUser({_id: req.params.id});
  if (!user) {
    return res.status(404).json({ message: req.t('errors:user_not_found') });
  }
  res.status(200).json({ message: req.t('common:user_deleted_successfully') });
});

export const updateUserPassword = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { password } = req.body;

  if (!req.user) {
    throw new AppError('errors:unauthorized', 401);
  }
  const adminId = (req.user as IUser)._id.toString(); // Cast to IUser after check

  const result = await userService.updateUserPasswordByAdmin(id, password, adminId);
  res.status(200).json({ message: req.t(result.messageKey) });
});

export const updateMyPassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  if (!req.user) {
    throw new AppError('errors:unauthorized', 401);
  }
  const userId = (req.user as IUser)._id.toString();

  const result = await userService.updateMyPassword(userId, currentPassword, newPassword);
  res.status(200).json({ message: req.t(result.messageKey) });
});
