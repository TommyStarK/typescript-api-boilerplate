import winston from 'winston';

import config from '../config';

const logger = winston.createLogger();

if (process.env.NODE_ENV === 'production' || config.app.production) {
  logger.add(new winston.transports.File({ filename: 'error.log', level: 'error' }));
  logger.add(new winston.transports.File({ filename: 'combined.log' }));
} else {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
    ),
  }));
}

export { logger as default };
