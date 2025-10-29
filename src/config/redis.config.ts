
import Redis from 'ioredis';
import { env } from './env';
import logger from '../utils/logger';

const redisConfig = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  maxRetriesPerRequest: null, // Important for handling connection errors gracefully
};

export const redis = new Redis(redisConfig);

redis.on('connect', () => {
  logger.info('✅ Redis connected successfully.');
});

redis.on('error', (err) => {
  logger.error('❌ Could not connect to Redis:', err);
});
