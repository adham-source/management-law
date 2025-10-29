
import winston from 'winston';
import { env } from '../config/env';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = () => {
  return env.NODE_ENV === 'development' ? 'debug' : 'info'; // Log info level in production
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

const devFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

const transports: winston.transport[] = [
  // We always log to the console
  new winston.transports.Console(),
];

// For production, also log to rotating files
if (env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/all.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  );
}

const logger = winston.createLogger({
  level: level(),
  levels,
  format: env.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports,
});

export default logger;
