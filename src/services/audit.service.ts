
import AuditLog from '../models/AuditLog.model';
import mongoose from 'mongoose';

interface LogOptions {
  user: mongoose.Types.ObjectId;
  action: string;
  targetResource?: string;
  targetResourceId?: mongoose.Types.ObjectId;
  details?: object;
  ipAddress?: string;
}

export const logActivity = async (options: LogOptions) => {
  try {
    await AuditLog.create(options);
  } catch (error) {
    console.error('Failed to log activity:', error);
    // We don't re-throw the error because logging should not crash the main operation
  }
};

export const getAuditLogs = async (filter: any, sort: any, limit: number, skip: number) => {
    return AuditLog.find(filter)
        .populate('user', 'name email')
        .sort(sort)
        .limit(limit)
        .skip(skip);
};
