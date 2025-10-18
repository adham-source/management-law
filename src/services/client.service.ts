
import Client, { IClient } from '../models/Client.model';
import { z } from 'zod';
import { createClientSchema, updateClientSchema } from '../validations/client.validation';
import mongoose from 'mongoose';

// Create Client Service
export const createClient = async (
  input: z.infer<typeof createClientSchema>['body'],
  userId: mongoose.Types.ObjectId
): Promise<IClient> => {
  const clientData = { ...input, createdBy: userId };
  return Client.create(clientData);
};

// Get All Clients Service
export const getAllClients = async (
  userId: mongoose.Types.ObjectId,
  filter: any,
  sort: any,
  limit: number,
  skip: number
): Promise<IClient[]> => {
  const baseQuery = { createdBy: userId };

  return Client.find({ ...baseQuery, ...filter })
    .sort(sort)
    .limit(limit)
    .skip(skip);
};

// Get Client By ID Service
export const getClientById = async (
  clientId: string,
  userId: mongoose.Types.ObjectId
): Promise<IClient | null> => {
  return Client.findOne({ _id: clientId, createdBy: userId });
};

// Update Client Service
export const updateClient = async (
  clientId: string,
  update: z.infer<typeof updateClientSchema>['body'],
  userId: mongoose.Types.ObjectId
): Promise<IClient | null> => {
  return Client.findOneAndUpdate({ _id: clientId, createdBy: userId }, update, { new: true });
};

// Delete Client Service
export const deleteClient = async (
  clientId: string,
  userId: mongoose.Types.ObjectId
): Promise<IClient | null> => {
  return Client.findOneAndDelete({ _id: clientId, createdBy: userId });
};
