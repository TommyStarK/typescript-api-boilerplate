import jwt from 'jsonwebtoken';
import uniqid from 'uniqid';

import config from '../config';
import mysql from '../database/mysql';
import utils from '../utils';

export default {
  authorize: async (request, response, next) => {
    if (request.body.username === undefined
      || request.body.password === undefined) {
      response.status(412).json({
        status: 412,
        success: false,
        message: 'Body missing username/password field(s)',
      });
      return;
    }

    try {
      const query = mysql.query();
      const passwordHash = utils.hash(request.body.password);
      const results = await query(
        'select userID, username from users where username = ? and password = ? order by username limit 1',
        [request.body.username, passwordHash],
      );

      if (!results.length) {
        response.status(401).json(
          { status: 401, success: false, message: 'Wrong credentials' },
        );
        return;
      }

      const payload = {
        username: results[0].username,
        userID: results[0].userID,
      };
      const newToken = await jwt.sign(
        payload, config.app.secret, { expiresIn: config.app.expiresIn },
      );
      response.status(200).json(
        { status: 200, success: true, token: newToken },
      );

      return;
    } catch (error) {
      next(error);
    }
  },

  register: async (request, response, next) => {
    if (request.body.username === undefined
      || request.body.password === undefined
      || request.body.email === undefined) {
      response.status(412).json({
        status: 412,
        success: false,
        message: 'Body missing username/email/password field(s)',
      });
      return;
    }

    if (utils.validateEmail(request.body.email) === false) {
      response.status(412).json(
        { status: 412, success: false, message: 'Invalid email' },
      );
      return;
    }

    try {
      const query = mysql.query();
      const emailEncrypted = utils.encrypt(request.body.email);
      const passwordHash = utils.hash(request.body.password);
      const check = 'select email, username from users where username = ? or email = ? order by email limit 1';
      const results = await query(check, [request.body.username, emailEncrypted]);

      if (results.length > 0) {
        let target = '';
        let content = '';

        if (results[0].username === request.body.username) {
          target = 'Username';
          content = results[0].username;
        } else {
          target = 'Email';
          content = request.body.email;
        }

        response.status(409).json({
          status: 409,
          success: false,
          message: `Conflict: ${target} [${content}] already used`,
        });

        return;
      }

      await query(
        'insert into `users`(`email`, `password`, `userID`, `username`) values(?,?,?,?)',
        [emailEncrypted, passwordHash, uniqid(), request.body.username],
      );

      response.status(201).json({
        status: 201,
        success: true,
        message: 'Account registered successfully.',
      });

      return;
    } catch (error) {
      next(error);
    }
  },

  unregister: async (request, response, next) => {
    if (request.body.username === undefined
      || request.body.password === undefined) {
      response.status(412).json({
        status: 412,
        success: false,
        message: 'Body missing username/password field(s)',
      });
      return;
    }

    try {
      const query = mysql.query();
      const passwordHash = utils.hash(request.body.password);
      const results = await query(
        'select userID from users where username = ? and password = ? order by username limit 1',
        [request.body.username, passwordHash],
      );

      if (!results.length) {
        response.status(401).json(
          { status: 401, success: false, message: 'Wrong credentials' },
        );
        return;
      }

      await query(
        'delete from users where username = ? and password = ? order by username limit 1',
        [request.body.username, passwordHash],
      );

      response.status(200).json({
        status: 200,
        success: true,
        message: 'Account unregistered successfully.',
      });

      return;
    } catch (error) {
      next(error);
    }
  },

};
