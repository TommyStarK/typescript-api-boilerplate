import jwt from 'jsonwebtoken';
import {config} from '../config';

async function authMiddleware(request, response, next) {
  const token = (request.body && request.body.access_token) ||
      (request.query && request.query.access_token) ||
      request.headers['x-access-token'] || request.headers.authorization;

  if (token) {
    try {
      const decoded = await jwt.verify(token, config.app.secret);
      request.decoded = decoded;
    } catch (error) {
      return response.status(401).json(
          {status: 401, success: false, message: 'Invalid token'});
    }

    try {
      // Retrieve user in db
      next();
    } catch (error) {
      next(error);
    }
  } else {
    return response.status(401).json(
        {status: 401, success: false, message: 'No token provided'});
  }
}

export {authMiddleware};