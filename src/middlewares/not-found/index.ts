import {
  NextFunction,
  Request,
  Response,
} from 'express';

export const notfoundMiddleware = (_: Request, response: Response, next: NextFunction) => {
  response.status(404).json({ status: 404, message: '404 not found' });
  next();
};
