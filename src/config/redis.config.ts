
import Redis from 'ioredis';
import { env } from './env';

const redisConfig = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  maxRetriesPerRequest: null, // Important for handling connection errors gracefully
};

export const redis = new Redis(redisConfig);
