
import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import * as googleService from '../services/google.service';
import { IUser } from '../models/User.model';

export const authorizeCalendar = asyncHandler(async (req: Request, res: Response) => {
    const authUrl = googleService.getGoogleAuthUrl();
    res.redirect(authUrl);
});

export const calendarCallback = asyncHandler(async (req: Request, res: Response) => {
    const { code } = req.query;
    if (!code) {
        return res.status(400).send('Google authorization code is missing.');
    }

    if (!req.user) {
        return res.status(401).send('User not authenticated.');
    }

    const user = req.user as IUser;

    try {
        await googleService.saveGoogleTokens(user._id, code as string);
        // You can redirect to a success page in your frontend application
        res.status(200).send('Google Calendar has been successfully linked!');
    } catch (error: any) {
        console.error('Failed to link Google Calendar:', error);
        res.status(500).send(`Failed to link Google Calendar: ${error.message}`);
    }
});
