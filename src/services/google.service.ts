import { google } from 'googleapis';
import User from '../models/User.model';
import mongoose from 'mongoose';
import AppError from '../utils/AppError';

// --- Configuration & Constants ---
const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALENDAR_REDIRECT_URI } = process.env;

const GOOGLE_CALENDAR_SCOPES = [
    'https://www.googleapis.com/auth/calendar'
];

// --- OAuth2 Client Initialization ---
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALENDAR_REDIRECT_URI) {
    console.warn('Google OAuth environment variables for Calendar integration are not fully set.');
}

export const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_CALENDAR_REDIRECT_URI
);

// --- Service Functions ---

/**
 * Generates the Google authentication URL for calendar access.
 * @returns {string} The authentication URL.
 */
export const getGoogleAuthUrl = (): string => {
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent', // Important to get a refresh token every time
        scope: GOOGLE_CALENDAR_SCOPES
    });
}

/**
 * Saves the Google tokens to the user's record after successful authorization.
 * @param {mongoose.Types.ObjectId} userId - The ID of the user.
 * @param {string} code - The authorization code from Google.
 */
export const saveGoogleTokens = async (userId: mongoose.Types.ObjectId, code: string): Promise<void> => {
    try {
        const { tokens } = await oauth2Client.getToken(code);
        if (!tokens.refresh_token) {
            // This can happen if the user has already granted consent and is not re-prompted.
            // The `prompt: 'consent'` in generateAuthUrl helps mitigate this.
            throw new AppError(
                'Failed to obtain refresh token from Google. Please try removing app access from your Google account settings and re-authorizing.',
                400
            );
        }

        await User.findByIdAndUpdate(userId, {
            googleCalendarTokens: {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiryDate: tokens.expiry_date,
            }
        });

        // Set credentials for the current request context
        oauth2Client.setCredentials(tokens);

    } catch (error: any) {
        // Re-throw as a controlled error if it's not one already
        if (error instanceof AppError) {
            throw error;
        }
        console.error("Error in saveGoogleTokens:", error.response?.data || error.message);
        throw new AppError('An error occurred while communicating with Google.', 500);
    }
};