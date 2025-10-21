
import User from '../models/User.model';
import Role, { IRole } from '../models/Role.model';
import { z } from 'zod';
import { registerSchema, loginSchema } from '../validations/auth.validation';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.utils';
import { sendVerificationEmail } from './email.service';
import mongoose from 'mongoose';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import AppError from '../utils/AppError';

// Admin/Internal User Creation Service
export const createUser = async (userData: z.infer<typeof registerSchema>['body']) => {
  const { name, email, password, role } = userData;
  const userExists = await User.findOne({ email });
  if (userExists) throw new AppError('User already exists', 400);

  const assignedRole = await Role.findById(role);
  if (!assignedRole) throw new AppError('Assigned role not found', 404);

  const user = await User.create({ name, email, password, role: assignedRole._id, isVerified: true });
  return { _id: user._id, name: user.name, email: user.email, role: assignedRole.name };
};

// Client Self-Registration Service
export const clientRegister = async (userData: Omit<z.infer<typeof registerSchema>['body'], 'role'>) => {
  const { name, email, password } = userData;
  const userExists = await User.findOne({ email });
  if (userExists) throw new AppError('User already exists', 400);

  const clientRole = await Role.findOne({ name: 'client' });
  if (!clientRole) throw new AppError('Default client role not found. Please create it.', 500);

  const user = new User({ name, email, password, role: clientRole._id });
  const verificationToken = user.createVerificationToken();
  await user.save();

  await sendVerificationEmail(user, verificationToken);
  
  return { message: 'Registration successful. Please check your email to verify your account.' };
};

// Verify Email Service
export const verifyEmail = async (token: string) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpires: { $gt: Date.now() },
  }).populate('role', 'name');

  if (!user) {
    throw new AppError('Token is invalid or has expired', 400);
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());
  user.refreshTokens = [refreshToken];
  await user.save();

  return {
    user: { _id: user._id, name: user.name, email: user.email, role: (user.role as IRole).name },
    accessToken,
    refreshToken,
  };
};

// Login User Service
export const loginUser = async (loginData: z.infer<typeof loginSchema>['body']) => {
  const { email, password } = loginData;

  const user = await User.findOne({ email }).select('+password').populate<{ role: IRole }>('role', 'name');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isVerified) {
    throw new AppError('Please verify your email before logging in.', 403);
  }

  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  user.refreshTokens = [...(user.refreshTokens || []), refreshToken];
  await user.save();

  return {
    user: { _id: user._id, name: user.name, email: user.email, role: (user.role as IRole).name },
    accessToken,
    refreshToken,
  };
};

// Logout User Service
export const logoutUser = async (userId: mongoose.Types.ObjectId, refreshToken: string) => {
  await User.updateOne({ _id: userId }, { $pull: { refreshTokens: refreshToken } });
};

// Verify refresh token and issue a new access token
export const refreshAccessToken = async (token: string): Promise<string | null> => {
  try {
    const decoded = jwt.verify(token, env.REFRESH_TOKEN_SECRET) as { id: string };
    const user = await User.findById(decoded.id);

    if (!user || !user.refreshTokens?.includes(token)) {
      return null;
    }

    return generateAccessToken(user._id.toString());
  } catch (error) {
    return null;
  }
};

