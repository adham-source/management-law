
import { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler';
import * as notificationService from '../services/notification.service';

export const getMyNotifications = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    const notifications = await notificationService.getUserNotifications(req.user._id);
    res.status(200).json(notifications);
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    const { id } = req.params;
    const notification = await notificationService.markNotificationAsRead(id, req.user._id);
    if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).json(notification);
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) return res.status(401).json({ message: 'Not authorized' });
    await notificationService.markAllNotificationsAsRead(req.user._id);
    res.status(200).json({ message: 'All notifications marked as read' });
});
