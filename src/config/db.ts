
import mongoose from 'mongoose';
import { env } from './env';
import logger from '../utils/logger';

const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    logger.info('MongoDB Connected...');
  } catch (err: any) {
    logger.error('Database connection failed:', err);
    throw err; // Re-throw the error to be caught by the caller
  }
};

export default connectDB;
