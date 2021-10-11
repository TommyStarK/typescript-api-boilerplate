import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { AppConfig } from '@app/config';
import { MySQLClient } from '@app/storage/mysql';

export const authMiddleware = (mysqlClient: MySQLClient) => async (
  request: Request, response: Response, next: NextFunction,
): Promise<void> => {
  const token = (request.body && request.body.access_token)
  || (request.query && request.query.access_token)
  || request.headers['x-auth-token']
  || request.headers['Proxy-Authorization']
  || request.headers.authorization;

  if (!token) {
    response.status(401).json({ status: 401, message: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, AppConfig.app.secret);
    request.decoded = decoded;
  } catch (error) {
    response.status(401).json({ status: 401, message: 'Invalid token' });
    return;
  }

  try {
    const [user] = await mysqlClient.query(
      'select 1 from users where userID = ? and username = ? order by username limit 1',
      [request.decoded.userID, request.decoded.username],
    );

    if (!user) {
      response.status(403).json({ status: 403, message: 'Forbidden' });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};
