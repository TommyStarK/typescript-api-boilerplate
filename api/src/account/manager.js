import jwt from 'jsonwebtoken';
import uniqid from 'uniqid';

import {config} from '../config';
import {database as mysql} from '../database/mysql';
import {utils} from '../utils';

export const account = {
  authorize: async (request, response, next) => {
    if (request.body.username === undefined ||
        request.body.password === undefined) {
      return response.status(412).json({
        status: 412,
        success: false,
        message: 'Body missing username/password field(s)'
      });
    }

    try {
      const query = mysql.query();
      const passwordHash = utils.hash(request.body.password);
      const results = await query(
          `select userID, username from users where username = ? and password = ? order by username limit 1`,
          [request.body.username, passwordHash]);

      if (!results.length) {
        return response.status(401).json(
            {status: 401, success: false, message: 'Wrong credentials'});
      }

      const payload = {
        username: results[0].username,
        userID: results[0].userID
      };
      const newToken = await jwt.sign(
          payload, config.app.secret, {expiresIn: config.app.expiresIn});
      return response.status(200).json(
          {status: 200, success: true, token: newToken});
    } catch (error) {
      next(error);
    }
  },

  register: async (request, response, next) => {
    if (request.body.username === undefined ||
        request.body.password === undefined ||
        request.body.email === undefined) {
      return response.status(412).json({
        status: 412,
        success: false,
        message: 'Body missing username/email/password field(s)'
      });
    }

    if (utils.validateEmail(request.body.email) === false) {
      return response.status(412).json(
          {status: 412, success: false, message: 'Invalid email'});
    }

    try {
      const query = mysql.query();
      const emailHash = utils.hash(request.body.email);
      const passwordHash = utils.hash(request.body.password);
      let check =
          `select email, username from users where username = ? or email = ? order by email limit 1`;
      const results = await query(check, [request.body.username, emailHash]);

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

        return response.status(409).json({
          status: 409,
          success: false,
          message: `Conflict: ${target} [${content}] already used`
        });
      }

      await query(
          'insert into `users`(`email`, `password`, `userID`, `username`) values(?,?,?,?)',
          [emailHash, passwordHash, uniqid(), request.body.username]);

      return response.status(200).json({
        status: 201,
        success: true,
        message: 'Account registered successfully.'
      });
    } catch (error) {
      next(error);
    }
  },

  unregister: async (request, response, next) => {
    if (request.body.username === undefined ||
        request.body.password === undefined) {
      return response.status(412).json({
        status: 412,
        success: false,
        message: 'Body missing username/password field(s)'
      });
    }

    try {
      const query = mysql.query();
      const passwordHash = utils.hash(request.body.password);
      const results = await query(
          `select 1 from users where username = ? and password = ? order by username limit 1`,
          [request.body.username, passwordHash]);

      if (!results.length) {
        return response.status(401).json(
            {status: 401, success: false, message: 'Wrong credentials'});
      }

      await query(
          `delete from users where username = ? and password = ? order by username limit 1`,
          [request.body.username, passwordHash]);

      return response.status(200).json({
        status: 200,
        success: true,
        message: 'Account unregistered successfully.'
      });
    } catch (error) {
      next(error);
    }
  }

};