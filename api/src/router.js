import express from 'express';

import {account} from './account/manager';
import {authMiddleware} from './auth/middleware';
import {config} from './config';

const router = new express.Router();

// First path handled
router.get(`/${config.app.url}`, (request, response, next) => {
  return response.status(200).json({
    status: 200,
    success: true,
    message: `Welcome to the ${config.app.name}`
  });
});

// Account management
router.post(`/${config.app.url}/authorize`, account.authorize);
router.post(`/${config.app.url}/register`, account.register);
router.delete(`/${config.app.url}/unregister`, account.unregister);

// Auth middleware
router.all(`/${config.app.url}/*`, [authMiddleware]);

// Auth required route
router.get(`/${config.app.url}/hello`, (request, response, next) => {
  return response.status(200).json({
    status: 200,
    success: true,
    message: `Hello ${request.decoded.username}`
  });
});

// 404 not found middleware
router.use((request, response, next) => {
  response.status(404).json(
      {status: 404, success: false, message: '404 not found'});
  next();
});

// 500 Internal server error middleware
router.use((err, request, response, next) => {
  console.log(err.message);
  response.status(500).json(
      {status: 500, success: false, message: 'Internal server error'});
});

export {router};