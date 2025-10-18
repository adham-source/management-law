
import Case, { ICase } from '../models/Case.model';
import mongoose from 'mongoose';
import { IUser } from '../models/User.model';
import { IRole } from '../models/Role.model';

// Create Case Service
export const createCase = async (
  input: Partial<ICase>,
  userId: mongoose.Types.ObjectId
): Promise<ICase> => {
  const caseData = { ...input, createdBy: userId };
  const newCase = await Case.create(caseData);

  return newCase;
};

// Get All Cases Service
export const getAllCases = async (
  user: IUser,
  filter: any,
  sort: any,
  limit: number,
  skip: number
): Promise<ICase[]> => {
  const baseQuery: any = {};
  if ((user.role as IRole).name === 'client') {
    baseQuery.clients = user._id;
  } else {
    baseQuery.$or = [{ createdBy: user._id }, { assignedLawyers: user._id }];
  }

  return Case.find({ ...baseQuery, ...filter })
    .populate('clients', 'name')
    .populate('assignedLawyers', 'name')
    .sort(sort)
    .limit(limit)
    .skip(skip);
};

// Get Case By ID Service
export const getCaseById = async (
  caseId: string,
  user: IUser
): Promise<ICase | null> => {
  const query: any = { _id: caseId };
  if ((user.role as IRole).name === 'client') {
    query.clients = user._id;
  } else {
    query.$or = [{ createdBy: user._id }, { assignedLawyers: user._id }];
  }

  return Case.findOne(query)
    .populate('clients', 'name email')
    .populate('assignedLawyers', 'name email');
};

// Update Case Service
export const updateCase = async (
  caseId: string,
  update: Partial<ICase>,
  userId: mongoose.Types.ObjectId
): Promise<ICase | null> => {
  // Only lawyers/admins assigned to or who created the case can update
  return Case.findOneAndUpdate({ _id: caseId, $or: [{ createdBy: userId }, { assignedLawyers: userId }] }, update, { new: true });
};

// Delete Case Service
export const deleteCase = async (
  caseId: string,
  userId: mongoose.Types.ObjectId
): Promise<ICase | null> => {
  // Only the creator (likely admin or senior lawyer) can delete
  return Case.findOneAndDelete({ _id: caseId, createdBy: userId });
};
