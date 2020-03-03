import jwt from 'jsonwebtoken';

import config from '../config';
import mysql from '../storage/mysql';

async function authMiddleware(request, response, next) {
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
      const query = mysql.query();
      const results = await query(
        'select 1 from users where userID = ? and username = ? order by username limit 1',
        [request.decoded.userID, request.decoded.username],
      );

      if (!results.length) {
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
}

export default authMiddleware;
