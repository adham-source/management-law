
import { google } from 'googleapis';
import User from '../models/User.model';
import { oauth2Client } from './google.service';
import mongoose from 'mongoose';

// Function to get an authenticated calendar instance for a user
const getCalendarClient = async (userId: mongoose.Types.ObjectId) => {
    const user = await User.findById(userId);
    if (!user || !user.googleCalendarTokens || !user.googleCalendarTokens.refreshToken) {
        throw new Error('User has not linked their Google Calendar or refresh token is missing.');
    }

    oauth2Client.setCredentials({
        refresh_token: user.googleCalendarTokens.refreshToken
    });

    // The access token will be automatically refreshed if it's expired
    return google.calendar({ version: 'v3', auth: oauth2Client });
}

interface AppointmentDetails {
    _id: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    attendees: any[]; // Should contain user objects with email
}

export const createCalendarEvent = async (userId: mongoose.Types.ObjectId, appointment: AppointmentDetails) => {
    const calendar = await getCalendarClient(userId);
    const event = {
        summary: appointment.title,
        description: appointment.description || '',
        start: { dateTime: appointment.startTime.toISOString(), timeZone: 'Africa/Cairo' },
        end: { dateTime: appointment.endTime.toISOString(), timeZone: 'Africa/Cairo' },
        attendees: appointment.attendees.map(att => ({ email: att.email })),
        reminders: {
            useDefault: false,
            overrides: [
                { method: 'email', minutes: 24 * 60 }, // 24 hours before
                { method: 'popup', minutes: 30 }, // 30 minutes before
            ],
        },
    };

    const res = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
    });

    return res.data.id; // Return the Google Calendar event ID
};

export const updateCalendarEvent = async (userId: mongoose.Types.ObjectId, googleEventId: string, appointment: AppointmentDetails) => {
    const calendar = await getCalendarClient(userId);
    const event = {
        summary: appointment.title,
        description: appointment.description || '',
        start: { dateTime: appointment.startTime.toISOString(), timeZone: 'Africa/Cairo' },
        end: { dateTime: appointment.endTime.toISOString(), timeZone: 'Africa/Cairo' },
        attendees: appointment.attendees.map(att => ({ email: att.email })),
    };

    await calendar.events.update({
        calendarId: 'primary',
        eventId: googleEventId,
        requestBody: event,
    });
};

export const deleteCalendarEvent = async (userId: mongoose.Types.ObjectId, googleEventId: string) => {
    const calendar = await getCalendarClient(userId);
    try {
        await calendar.events.delete({
            calendarId: 'primary',
            eventId: googleEventId,
        });
    } catch (error: any) {
        // If the event is already deleted, Google sends a 410 error, which we can ignore.
        if (error.code !== 410) {
            throw error;
        }
        console.log('Event was already deleted from Google Calendar.');
    }
};
