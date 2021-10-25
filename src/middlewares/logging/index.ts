import { NextFunction, Request, Response } from 'express';

import logger from '@app/logger';

export const logMiddleware = (request: Request, response: Response, next: NextFunction): void => {
  const {
    method,
    url,
    params,
    query,
    body,
    user,
  } = request;

  logger.info({
    method,
    url,
    params,
    query,
    body,
    user,
  });

  const then = (): void => {
    const { statusCode } = response;
    response.removeListener('finish', then);
    response.removeListener('close', then);
    logger.info({
      method,
      url,
      statusCode,
      user,
    });
  };

  response.on('finish', then);
  response.on('close', then);
  next();
};
