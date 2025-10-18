
import cron from 'node-cron';
import Case from '../models/Case.model';
import { createNotification } from '../services/notification.service';
import mongoose from 'mongoose';

const checkDeadlines = async () => {
    console.log('Running deadline checker job...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    try {
        const cases = await Case.find({
            status: { $in: ['open', 'pending'] },
            'criticalDates.0': { $exists: true } // Optimization: only get cases that have critical dates
        }).populate('assignedLawyers', '_id');

        for (const caseFile of cases) {
            for (const criticalDate of caseFile.criticalDates || []) {
                const deadline = new Date(criticalDate.date);
                deadline.setHours(0, 0, 0, 0);

                let message: string | null = null;

                if (deadline.getTime() === today.getTime()) {
                    message = `URGENT: The deadline for "${criticalDate.description}" in case "${caseFile.title}" is today.`;
                } else if (deadline.getTime() === threeDaysFromNow.getTime()) {
                    message = `REMINDER: The deadline for "${criticalDate.description}" in case "${caseFile.title}" is in 3 days.`;
                } else if (deadline.getTime() === sevenDaysFromNow.getTime()) {
                    message = `HEADS UP: The deadline for "${criticalDate.description}" in case "${caseFile.title}" is in 7 days.`;
                }

                if (message) {
                    for (const lawyer of caseFile.assignedLawyers as any[]) {
                        await createNotification(lawyer._id, message, `/cases/${caseFile._id}`);
                    }
                }
            }
        }
        console.log('Deadline checker job finished.');
    } catch (error) {
        console.error('Error running deadline checker job:', error);
    }
};

// Schedule the job to run every day at 8:00 AM
export const startDeadlineChecker = () => {
    cron.schedule('0 8 * * *', checkDeadlines, {
        timezone: "Africa/Cairo"
    });
    console.log('Deadline checker job scheduled to run every day at 8:00 AM (Cairo Time).');
};
