
import { Request, Response } from 'express';
import { IUser } from '../models/User.model';
import * as authService from '../services/auth.service';
import asyncHandler from '../utils/asyncHandler';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.utils';

// Admin/Internal User Creation Controller
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.createUser(req.body);
  res.status(201).json(result);
});

// Client Self-Registration Controller
export const clientRegister = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.clientRegister(req.body);
  res.status(201).json({ message: req.t(result.messageKey) });
});

// Verify Email Controller
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;
  if (!token) {
    return res.status(400).json({ message: req.t('errors:verification_token_required') });
  }
  const result = await authService.verifyEmail(token as string);
  // In a real app, you might redirect to the frontend login page
  res.status(200).json(result);
});

// Login Controller
export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.loginUser(req.body);
  res.status(200).json(result);
});

// Get Me Controller (Protected)
export const getMe = (req: Request, res: Response) => {
  res.status(200).json(req.user);
};

// Google Auth Callback Controller
export const googleCallback = (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({ message: req.t('errors:unauthorized') });
    }
    const user = req.user as IUser;
    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString(), user.tokenVersion);
    // Here you should also save the refresh token to the user record in the DB
    res.status(200).json({ user, accessToken, refreshToken });
};

// Refresh Access Token Controller
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: req.t('errors:refresh_token_required') });
  }
  const result = await authService.refreshAccessToken(refreshToken);

  if (!result) {
    return res.status(401).json({ message: req.t('errors:invalid_refresh_token') });
  }

  res.status(200).json(result);
});

// Logout Controller
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    // This case might not be strictly necessary if the token is always sent, but good for robustness
    return res.status(400).json({ message: req.t('errors:refresh_token_required') });
  }
  const result = await authService.logoutUser(refreshToken);
  res.status(200).json({ message: req.t('common:logout_successful') });
});

// Forgot Password Controller
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.forgotPassword(req.body);
  res.status(200).json({ message: req.t(result.messageKey) });
});

// Reset Password Controller
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.resetPassword(req.params as { token: string }, req.body);
  res.status(200).json({ message: req.t(result.messageKey) });
});

// Logout All Devices Controller
export const logoutAllDevices = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: req.t('errors:unauthorized') });
  }
  const userId = (req.user as IUser)._id.toString();
  const result = await authService.logoutAllDevices(userId);
  res.status(200).json({ message: req.t(result.messageKey) });
});
