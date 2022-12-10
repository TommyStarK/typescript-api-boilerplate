import {
  NextFunction,
  Request,
  Response,
} from 'express';

import jwt from 'jsonwebtoken';

import { PostgreSQLClient, findUserByUsernameAndUserID } from '@app/backends/postgres';
import { AppConfig } from '@app/config';
import logger from '@app/logger';
import { ForbiddenError, UnauthorizedError } from '@app/utils/errors';

export const authMiddleware = (postgreClient: PostgreSQLClient) => async (
  request: Request, _: Response, next: NextFunction,
): Promise<void> => {
  const token = (request.body && request.body.access_token)
    || (request.query && request.query.access_token)
    || request.headers['x-auth-token']
    || request.headers['Proxy-Authorization']
    || request.headers.authorization;

  if (!token) {
    return next(new UnauthorizedError('no token provided'));
  }

  try {
    const decoded = jwt.verify(token, AppConfig.app.secret);
    const { userID, username } = decoded as jwt.JwtPayload;
    request.user = { userID, username };
  } catch (error) {
    return next(new UnauthorizedError('invalid token'));
  }

  try {
    const findUserByUsernameAndUserIDQuery = findUserByUsernameAndUserID(request.user.userID, request.user.username);
    logger.debug({ findUserByUsernameAndUserIDQuery });

    const [user] = await postgreClient.query(findUserByUsernameAndUserIDQuery);

    if (!user) {
      throw new ForbiddenError();
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
