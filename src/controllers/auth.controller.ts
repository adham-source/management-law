
import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { generateTokens } from '../utils/jwt.utils';
import asyncHandler from '../utils/asyncHandler';

// Admin/Internal User Creation Controller
export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.createUser(req.body);
  res.status(201).json(result);
});

// Client Self-Registration Controller
export const clientRegister = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.clientRegister(req.body);
  res.status(201).json(result);
});

// Verify Email Controller
export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ message: 'Verification token is required' });
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
        return res.status(401).json({ message: 'User not authenticated' });
    }
    const user = req.user as any; 
    const tokens = generateTokens(user._id.toString());
    res.status(200).json({ user, ...tokens });
};

// Refresh Access Token Controller
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }
  const result = await authService.refreshAccessToken(refreshToken);
  res.status(200).json(result);
});

// Logout Controller
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!req.user || !refreshToken) {
    return res.status(400).json({ message: 'User and refresh token are required' });
  }
  await authService.logoutUser(req.user._id, refreshToken);
  res.status(200).json({ message: 'Logged out successfully' });
});
