import Role, { IRole } from '../models/Role.model';
import { redis as redisClient } from '../config/redis.config';
import mongoose from 'mongoose';

const ROLE_CACHE_KEY = 'cache:roles';
const SINGLE_ROLE_CACHE_KEY = (roleId: string) => `cache:role:${roleId}`;
const CACHE_EXPIRATION = 3600; // 1 hour

export const createRole = async (input: Partial<IRole>): Promise<IRole> => {
  const role = await Role.create(input);
  // Invalidate the cache for the list of all roles
  await redisClient.del(ROLE_CACHE_KEY);
  return role;
};

export const getAllRoles = async (): Promise<IRole[]> => {
  // 1. Check cache first
  const cachedRoles = await redisClient.get(ROLE_CACHE_KEY);
  if (cachedRoles) {
    return JSON.parse(cachedRoles);
  }

  // 2. If not in cache, get from DB
  const roles = await Role.find().populate('permissions');

  // 3. Store in cache for future requests
  await redisClient.set(ROLE_CACHE_KEY, JSON.stringify(roles), 'EX', CACHE_EXPIRATION);

  return roles;
};

export const getRoleById = async (roleId: string): Promise<IRole | null> => {
  // 1. Check cache first
  const cachedRole = await redisClient.get(SINGLE_ROLE_CACHE_KEY(roleId));
  if (cachedRole) {
    return JSON.parse(cachedRole);
  }

  // 2. If not in cache, get from DB
  const role = await Role.findById(roleId).populate('permissions');

  // 3. Store in cache if found
  if (role) {
    await redisClient.set(SINGLE_ROLE_CACHE_KEY(roleId), JSON.stringify(role), 'EX', CACHE_EXPIRATION);
  }

  return role;
};

export const updateRole = async (roleId: string, update: Partial<IRole>): Promise<IRole | null> => {
  const role = await Role.findByIdAndUpdate(roleId, update, { new: true });
  if (role) {
    // Invalidate caches
    await redisClient.del(ROLE_CACHE_KEY);
    await redisClient.del(SINGLE_ROLE_CACHE_KEY(roleId));
    // Optionally, re-cache the updated role
    await redisClient.set(SINGLE_ROLE_CACHE_KEY(roleId), JSON.stringify(role), 'EX', CACHE_EXPIRATION);
  }
  return role;
};

export const deleteRole = async (roleId: string): Promise<IRole | null> => {
  const role = await Role.findByIdAndDelete(roleId);
  if (role) {
    // Invalidate caches
    await redisClient.del(ROLE_CACHE_KEY);
    await redisClient.del(SINGLE_ROLE_CACHE_KEY(roleId));
  }
  return role;
};