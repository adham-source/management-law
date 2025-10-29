
import User from '../models/User.model';
import Role, { IRole } from '../models/Role.model';
import { z } from 'zod';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../validations/auth.validation';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.utils';
import { sendVerificationEmail, sendPasswordResetEmail, sendPasswordChangedNotificationEmail } from './email.service';
import mongoose from 'mongoose';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import AppError from '../utils/AppError';
import { redis } from '../config/redis.config';

const REFRESH_TOKEN_EXPIRATION_SECONDS = 7 * 24 * 60 * 60; // 7 days

interface DecodedRefreshToken {
  id: string;
  tokenVersion: number;
}

// Admin/Internal User Creation Service
export const createUser = async (userData: z.infer<typeof registerSchema>['body']) => {
  const { name, email, password, role } = userData;
  const userExists = await User.findOne({ email });
  if (userExists) throw new AppError('errors:user_already_exists', 400);

  const assignedRole = await Role.findById(role);
  if (!assignedRole) throw new AppError('errors:role_not_found', 404);

  const user = await User.create({ name, email, password, role: assignedRole._id, isVerified: true });
  return { _id: user._id, name: user.name, email: user.email, role: assignedRole.name };
};

// Client Self-Registration Service
export const clientRegister = async (userData: Omit<z.infer<typeof registerSchema>['body'], 'role'>) => {
  const { name, email, password } = userData;
  const userExists = await User.findOne({ email });
  if (userExists) throw new AppError('errors:user_already_exists', 400);

  const clientRole = await Role.findOne({ name: 'client' });
  if (!clientRole) throw new AppError('errors:client_role_not_found', 500);

  const user = new User({ name, email, password, role: clientRole._id });
  const verificationToken = user.createVerificationToken();
  await user.save();

  await sendVerificationEmail(user, verificationToken);
  
  return { messageKey: 'common:registration_successful' };
};

// Verify Email Service
export const verifyEmail = async (token: string) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpires: { $gt: Date.now() },
  }).populate('role', 'name');

  if (!user) {
    throw new AppError('errors:invalid_token', 400);
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString(), user.tokenVersion);
  
  // Store refresh token in Redis with user ID and token version
  await redis.set(`rt:${user._id}:${user.tokenVersion}:${refreshToken}`, user._id.toString(), 'EX', REFRESH_TOKEN_EXPIRATION_SECONDS);

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
    throw new AppError('errors:invalid_credentials', 401);
  }

  if (!user.isVerified) {
    throw new AppError('errors:email_not_verified', 403);
  }

  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString(), user.tokenVersion);

  // Store refresh token in Redis with user ID and token version
  await redis.set(`rt:${user._id}:${user.tokenVersion}:${refreshToken}`, user._id.toString(), 'EX', REFRESH_TOKEN_EXPIRATION_SECONDS);

  return {
    user: { _id: user._id, name: user.name, email: user.email, role: (user.role as IRole).name },
    accessToken,
    refreshToken,
  };
};

// Forgot Password Service
export const forgotPassword = async (body: z.infer<typeof forgotPasswordSchema>['body']) => {
  const { email } = body;
  const user = await User.findOne({ email });

  // Even if user doesn't exist, we don't reveal it for security reasons.
  // We only proceed if the user exists and is verified.
  if (user && user.isVerified) {
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false }); // Skip validation to save token fields

    try {
      await sendPasswordResetEmail(user, resetToken);
    } catch (error) {
      // If email fails, reset the token fields to allow user to try again
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      throw new AppError('errors:email_send_failed', 500);
    }
  }
  // Always return a success-like message to prevent email enumeration
  return { messageKey: 'common:password_reset_email_sent' };
};

// Reset Password Service
export const resetPassword = async (params: z.infer<typeof resetPasswordSchema>['params'], body: z.infer<typeof resetPasswordSchema>['body']) => {
  const { token } = params;
  const { password } = body;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('errors:invalid_or_expired_token', 400);
  }

  // Set new password
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  // The pre-save hook will hash the password and set passwordChangedAt and increment tokenVersion
  await user.save();

  // Send password changed notification email
  await sendPasswordChangedNotificationEmail(user, 'النظام'); // Initiated by the system

  // Return a success message
  return { messageKey: 'common:password_reset_successful' };
};


// Logout User Service (from current device)
export const logoutUser = async (refreshToken: string) => {
  try {
    const decoded = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET) as DecodedRefreshToken;
    // Delete the specific refresh token from Redis
    await redis.del(`rt:${decoded.id}:${decoded.tokenVersion}:${refreshToken}`);
  } catch (error) {
    // If token is invalid or expired, just ignore and return success
    console.error("Error decoding refresh token during logout:", error);
  }
};

// Logout User from All Devices
export const logoutAllDevices = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('errors:user_not_found', 404);
  }

  // Increment token version to invalidate all previous refresh tokens
  user.tokenVersion = user.tokenVersion + 1;
  await user.save({ validateBeforeSave: false }); // Skip validation as only tokenVersion is changed

  // Delete all refresh tokens for this user from Redis
  // This is a more robust way to ensure all tokens are gone, though tokenVersion handles most of it.
  const keys = await redis.keys(`rt:${user._id}:*`);
  if (keys.length > 0) {
    await redis.del(...keys);
  }

  return { messageKey: 'common:logout_all_devices_successful' };
};

// Verify refresh token, implement rotation, and issue a new access token
export const refreshAccessToken = async (token: string): Promise<{ accessToken: string; refreshToken: string } | null> => {
  try {
    const decoded = jwt.verify(token, env.REFRESH_TOKEN_SECRET) as DecodedRefreshToken;

    const user = await User.findById(decoded.id);
    if (!user) {
      return null;
    }

    // Check if the token version matches the user's current token version
    if (decoded.tokenVersion !== user.tokenVersion) {
      // Token is invalid due to password change or logout all devices
      // Also delete the token from Redis if it still exists (edge case)
      await redis.del(`rt:${decoded.id}:${decoded.tokenVersion}:${token}`);
      return null;
    }

    // Check if the token exists in Redis
    const redisKey = `rt:${decoded.id}:${decoded.tokenVersion}:${token}`;
    const userIdInRedis = await redis.get(redisKey);
    if (!userIdInRedis || userIdInRedis !== decoded.id) {
      // Token is invalid, used, or expired from Redis
      return null;
    }

    // --- Token Rotation ---
    // Invalidate the used refresh token from Redis
    await redis.del(redisKey);

    // Issue new tokens
    const newAccessToken = generateAccessToken(user._id.toString());
    const newRefreshToken = generateRefreshToken(user._id.toString(), user.tokenVersion);

    // Store the new refresh token in Redis
    await redis.set(`rt:${user._id}:${user.tokenVersion}:${newRefreshToken}`, user._id.toString(), 'EX', REFRESH_TOKEN_EXPIRATION_SECONDS);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };

  } catch (error) {
    // This will catch errors from jwt.verify (e.g., expired token, invalid signature)
    return null;
  }
};

