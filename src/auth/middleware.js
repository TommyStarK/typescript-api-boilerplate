import jwt from 'jsonwebtoken';

import config from '../config';
import mysql from '../database/mysql';

async function authMiddleware(request, response, next) {
  const token = (request.body && request.body.access_token)
  || (request.query && request.query.access_token)
  || request.headers['x-access-token'] || request.headers.authorization;

  if (token) {
    try {
      const decoded = await jwt.verify(token, config.app.secret);
      request.decoded = decoded;
    } catch (error) {
      response.status(401).json(
        { status: 401, success: false, message: 'Invalid token' },
      );
      return;
    }

    try {
      const query = mysql.query();
      const results = await query(
        'select 1 from users where userID = ? and username = ? order by username limit 1',
        [request.decoded.userID, request.decoded.username],
      );

      if (!results.length) {
        response.status(403).json(
          { status: 403, success: false, message: 'Forbidden' },
        );
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  } else {
    response.status(401).json(
      { status: 401, success: false, message: 'No token provided' },
    );
  }
}

export default authMiddleware;
