
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import AppError from '../utils/AppError';

// A simple check to see if a string is likely a translation key
const isTranslationKey = (str: string) => str.includes(':');

const sendErrorDev = (err: AppError, req: Request, res: Response) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: isTranslationKey(err.message) ? req.t(err.message) : err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err: AppError, req: Request, res: Response) => {
  // Operational, trusted error: send translated message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: isTranslationKey(err.message) ? req.t(err.message) : err.message,
    });
  // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error('ERROR 💥', err);

    // 2) Send generic translated message
    res.status(500).json({
      status: 'error',
      message: req.t('errors:something_went_wrong'),
    });
  }
};

const errorHandler = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (env.NODE_ENV === 'production') {
    // Create a hard copy of the error object to avoid mutations
    let error = { ...err, name: err.name, message: err.message, stack: err.stack };

    // You can add handlers for specific error names here (e.g., CastError, ValidationError)

    sendErrorProd(error, req, res);
  }
};

export default errorHandler;
