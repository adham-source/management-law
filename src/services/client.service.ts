
import Client, { IClient } from '../models/Client.model';
import Case from '../models/Case.model';
import { z } from 'zod';
import { createClientSchema, updateClientSchema } from '../validations/client.validation';
import mongoose from 'mongoose';
import { IUser } from '../models/User.model';
import { IRole } from '../models/Role.model';

// Create Client Service
export const createClient = async (
  input: z.infer<typeof createClientSchema>['body'],
  user: IUser
): Promise<IClient> => {
  const clientData = { ...input, createdBy: user._id };
  return Client.create(clientData);
};

// Get All Clients Service
export const getAllClients = async (
  user: IUser,
  filter: any,
  sort: any,
  limit: number,
  skip: number
): Promise<IClient[]> => {
  const userRole = user.role as IRole;
  let query: any = filter;

  if (userRole.name !== 'admin') {
    // For non-admins, find cases they are assigned to or created
    const userCases = await Case.find({ $or: [{ createdBy: user._id }, { assignedLawyers: user._id }] }).select('clients');
    const clientIds = userCases.flatMap(c => c.clients);
    // Also include clients they created directly
    const directlyCreatedClients = { createdBy: user._id };

    query = {
      ...filter,
      $or: [
        { _id: { $in: clientIds } },
        directlyCreatedClients
      ]
    };
  }

  return Client.find(query)
    .sort(sort)
    .limit(limit)
    .skip(skip);
};

// Get Client By ID Service
export const getClientById = async (
  clientId: string,
  user: IUser
): Promise<IClient | null> => {
  const client = await Client.findById(clientId);
  if (!client) return null;

  const userRole = user.role as IRole;
  if (userRole.name === 'admin') {
    return client;
  }

  // Check if user created the client
  if (client.createdBy.equals(user._id)) {
    return client;
  }

  // Check if user is associated with the client via a case
  const isAssociated = await Case.exists({ 
    clients: clientId, 
    $or: [{ createdBy: user._id }, { assignedLawyers: user._id }]
  });

  return isAssociated ? client : null;
};

// Update Client Service
export const updateClient = async (
  clientId: string,
  update: z.infer<typeof updateClientSchema>['body'],
  user: IUser
): Promise<IClient | null> => {
  const client = await getClientById(clientId, user); // Use our secure getter
  if (!client) return null; // If getter returns null, user is not authorized
  
  return Client.findByIdAndUpdate(clientId, update, { new: true });
};

// Delete Client Service
export const deleteClient = async (
  clientId: string,
  user: IUser
): Promise<IClient | null> => {
  const client = await getClientById(clientId, user); // Use our secure getter
  if (!client) return null; // If getter returns null, user is not authorized

  // Add extra check: maybe only admins or original creator can delete
  const userRole = user.role as IRole;
  if (userRole.name !== 'admin' && !client.createdBy.equals(user._id)) {
      return null; // Not an admin and not the creator
  }

  return Client.findByIdAndDelete(clientId);
};
