import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import config from '@app/config';
import IoCMySQLClientIdentifier from '@app/storage/mysql/symbol';
import IoCMySQLClientContainer from '@app/storage/mysql/container';
import { MySQLClient } from '@app/storage/mysql';

export const authMiddleware = async (request: Request, response: Response, next: NextFunction): Promise<void> => {
  const token = (request.body && request.body.access_token)
  || (request.query && request.query.access_token)
  || request.headers['x-access-token'] || request.headers.authorization;

  if (token) {
    try {
      const decoded = jwt.verify(token, config.app.secret);
      request.decoded = decoded;
    } catch (error) {
      response.status(401).json({ status: 401, message: 'Invalid token' });
      return;
    }

    try {
      const mysql = IoCMySQLClientContainer.get<MySQLClient>(IoCMySQLClientIdentifier);
      // const query = mysql.query();
      const connection = await mysql.getConnection();
      // const results = await query(
      //   'select 1 from users where userID = ? and username = ? order by username limit 1',
      //   [request.decoded.userID, request.decoded.username],
      // );
      const [rows] = await connection.query(
        'select 1 from users where userID = ? and username = ? order by username limit 1',
        [request.decoded.userID, request.decoded.username],
      );

      connection.release();
      const users = mysql.processRows(rows);

      if (!users.length) {
        response.status(403).json({ status: 403, message: 'Forbidden' });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  } else {
    response.status(401).json({ status: 401, message: 'No token provided' });
  }
};
