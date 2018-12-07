import jwt from 'jsonwebtoken';

import {config} from '../config';
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
      const payload = {username: 'toto', userID: '1'};
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
      return response.status(200).json({
        status: 200,
        success: true,
        message: 'Account unregistered successfully.'
      });


      // return response.status(401).json({
      //   status: 401,
      //   success: false,
      //   message: 'Wrong credentials'
      // });
    } catch (error) {
      next(error);
    }
  }

};