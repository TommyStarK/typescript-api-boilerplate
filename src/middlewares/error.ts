import { NextFunction, Request, Response } from 'express';

import logger from '@app/logger';

export const errorMiddleware = (err: Error, _: Request, response: Response, next: NextFunction) => {
  logger.error(err.stack);
  response.status(500).json({ status: 500, message: 'Internal server error' });
  next();
};
