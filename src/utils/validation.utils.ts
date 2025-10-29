import mongoose from 'mongoose';
import AppError from './AppError';

export const validateObjectId = (id: mongoose.Types.ObjectId | string | undefined, errorKey: string = 'errors:invalid_id', statusCode: number = 400): void => {
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(errorKey, statusCode);
  }
};