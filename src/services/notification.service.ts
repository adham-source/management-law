import Notification, { INotification } from '../models/Notification.model';
import mongoose from 'mongoose';
import { getIO } from '../config/socket.config';

// Create a notification
export const createNotification = async (userId: mongoose.Types.ObjectId, message: string, link?: string): Promise<INotification> => {
  const notification = await Notification.create({ user: userId, message, link });

  // Emit a real-time event to the specific user
  const io = getIO();
  io.to(userId.toString()).emit('new_notification', notification);

  return notification;
};

// Get notifications for a user
export const getUserNotifications = async (userId: mongoose.Types.ObjectId): Promise<INotification[]> => {
  return Notification.find({ user: userId }).sort({ createdAt: -1 });
};

// Mark a notification as read
export const markNotificationAsRead = async (notificationId: string, userId: mongoose.Types.ObjectId): Promise<INotification | null> => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { isRead: true },
    { new: true }
  );
  return notification;
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId: mongoose.Types.ObjectId): Promise<any> => {
    return Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
};