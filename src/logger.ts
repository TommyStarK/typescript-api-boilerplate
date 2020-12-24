import winston from 'winston';
import config from '@app/config';

const transports: winston.transport[] = process.env.NODE_ENV === 'production' || config.app.production
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
    winston.format.label({ label: `${process.env.NODE_ENV ? process.env.NODE_ENV : 'local'}` }),
    winston.format.colorize(),
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.printf((info) => `[${info.label}][${info.timestamp}] ${info.level}: ${info.message}`),
  ),
  transports,
});

export default logger;
