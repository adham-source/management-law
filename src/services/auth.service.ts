
import User from '../models/User.model';
import Role, { IRole } from '../models/Role.model';
import { z } from 'zod';
import { registerSchema, loginSchema } from '../validations/auth.validation';
import { generateTokens, verifyToken } from '../utils/jwt.utils';
// import { sendVerificationEmail } from './notification.service';
import mongoose from 'mongoose';
import crypto from 'crypto';

// Admin/Internal User Creation Service
export const createUser = async (userData: z.infer<typeof registerSchema>['body']) => {
  const { name, email, password, role } = userData;
  const userExists = await User.findOne({ email });
  if (userExists) throw new Error('User already exists');

  // Ensure the role exists
  const assignedRole = await Role.findById(role);
  if (!assignedRole) throw new Error('Assigned role not found');

  const user = await User.create({ name, email, password, role: assignedRole._id, isVerified: true });
  return { _id: user._id, name: user.name, email: user.email, role: assignedRole.name };
};

// Client Self-Registration Service
export const clientRegister = async (userData: Omit<z.infer<typeof registerSchema>['body'], 'role'>) => {
  const { name, email, password } = userData;
  const userExists = await User.findOne({ email });
  if (userExists) throw new Error('User already exists');

  // Find the default 'client' role
  const clientRole = await Role.findOne({ name: 'client' });
  if (!clientRole) throw new Error('Default client role not found. Please create it.');

  const user = new User({ name, email, password, role: clientRole._id });
  const verificationToken = user.createVerificationToken();
  await user.save();

  // TODO: Implement and send verification email
  // await sendVerificationEmail(user.email, verificationToken);

  return { message: 'Registration successful. Please check your email to verify your account.' };
};

// Verify Email Service
export const verifyEmail = async (token: string) => {
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpires: { $gt: Date.now() },
  }).populate('role', 'name'); // Populate role name

  if (!user) {
    throw new Error('Token is invalid or has expired');
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  // Automatically log the user in upon successful verification
  const tokens = generateTokens(user._id.toString());
  user.refreshTokens = [tokens.refreshToken];
  await user.save();

  return {
    user: { _id: user._id, name: user.name, email: user.email, role: (user.role as IRole).name },
    ...tokens,
  };
};

// Login User Service
export const loginUser = async (loginData: z.infer<typeof loginSchema>['body']) => {
  const { email, password } = loginData;

  const user = await User.findOne({ email }).select('+password').populate<{ role: IRole }>('role', 'name'); // Populate role name
  if (!user || !(await user.comparePassword(password))) {
    throw new Error('Invalid email or password');
  }

  if (!user.isVerified) {
    throw new Error('Please verify your email before logging in.');
  }

  const tokens = generateTokens(user._id.toString());

  user.refreshTokens = [...(user.refreshTokens || []), tokens.refreshToken];
  await user.save();

  return {
    user: { _id: user._id, name: user.name, email: user.email, role: (user.role as IRole).name },
    ...tokens,
  };
};

// Logout User Service
export const logoutUser = async (userId: mongoose.Types.ObjectId, refreshToken: string) => {
  await User.updateOne({ _id: userId }, { $pull: { refreshTokens: refreshToken } });
};

// Refresh Access Token Service
export const refreshAccessToken = async (refreshToken: string) => {
  const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
  if (!refreshSecret) throw new Error('REFRESH_TOKEN_SECRET is not defined');

  const { decoded } = verifyToken(refreshToken, refreshSecret);
  if (!decoded) throw new Error('Invalid refresh token');

  const user = await User.findOne({ _id: (decoded as any).id, refreshTokens: refreshToken }).populate<{ role: IRole }>('role', 'name'); // Populate role name
  if (!user) throw new Error('Refresh token not found for user');

  const { accessToken } = generateTokens(user._id.toString());
  return { accessToken };
};
