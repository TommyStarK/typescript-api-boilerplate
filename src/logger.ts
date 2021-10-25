import winston from 'winston';

import { AppConfig } from '@app/config';

const transports: winston.transport[] = process.env.NODE_ENV === 'production' || AppConfig.app.production
  ? [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ]
  : [
    new winston.transports.Console(),
  ];

const logger: winston.Logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]' }),
    winston.format.json(),
  ),
  transports,
});

export default logger;
