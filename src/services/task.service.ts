import Task, { ITask } from '../models/Task.model';
import User from '../models/User.model';
import mongoose from 'mongoose';
import { IUser } from '../models/User.model';
import { IRole } from '../models/Role.model';

import { getIO } from '../config/socket.config';

// Create Task
export const createTask = async (input: Partial<ITask>, userId: mongoose.Types.ObjectId): Promise<ITask> => {
  const task = await Task.create({ ...input, createdBy: userId });

  // Emit a real-time event to the assigned user
  if (task.assignedTo) {
    const io = getIO();
    io.to(task.assignedTo.toString()).emit('new_task', task);
  }

  return task;
};

// Get tasks with authorization
export const getTasks = async (query: any, user: IUser, sort: any, limit: number, skip: number): Promise<ITask[]> => {
    const userRole = user.role as IRole;
    if (userRole.name !== 'admin') {
        // Non-admins can only see tasks assigned to them
        query.assignedTo = user._id;
    }
    return Task.find(query).populate('assignedTo', 'name email').populate('relatedCase', 'title').sort(sort).limit(limit).skip(skip);
};

// Get a single task with authorization
export const findTaskById = async (taskId: string, user: IUser): Promise<ITask | null> => {
    const task = await Task.findById(taskId);
    if (!task) return null;

    const userRole = user.role as IRole;
    if (userRole.name === 'admin' || task.assignedTo.equals(user._id) || task.createdBy.equals(user._id)) {
        return task.populate('assignedTo', 'name email hourlyRate');
    }

    return null; // Not authorized
};

// Update Task
export const updateTask = async (taskId: string, update: Partial<ITask>, user: IUser): Promise<ITask | null> => {
    const task = await findTaskById(taskId, user);
    if (!task) return null;
    Object.assign(task, update);
    return task.save();
};

// Delete Task
export const deleteTask = async (taskId: string, user: IUser): Promise<ITask | null> => {
    // Only admin or creator can delete
    const task = await Task.findById(taskId);
    if (!task) return null;

    const userRole = user.role as IRole;
    if (userRole.name !== 'admin' && !task.createdBy.equals(user._id)) {
        return null; // Not authorized
    }

    await task.deleteOne();
    return task;
};

// Log hours and calculate cost
export const logHoursAndCalculateCost = async (taskId: string, hours: number, user: IUser): Promise<ITask | null> => {
    const task = await findTaskById(taskId, user);
    if (!task) return null; // Not found or not authorized

    // Ensure the user logging hours is the one assigned to the task
    if (!task.assignedTo.equals(user._id)) {
        throw new Error('You can only log hours for tasks assigned to you.');
    }

    const assignedUser = await User.findById(task.assignedTo);
    if (!assignedUser) {
        throw new Error('Assigned user not found.');
    }

    task.hoursSpent += hours;
    task.cost = task.hoursSpent * (assignedUser.hourlyRate || 0);
    
    // Optionally, update status if hours are logged
    if (task.status === 'pending') {
        task.status = 'in_progress';
    }

    return task.save();
};