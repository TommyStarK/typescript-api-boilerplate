import express from 'express';

import {config} from './config';
import {account} from './account/manager';
import {authMiddleware} from './auth/middleware';

const router = new express.Router();

router.get(`/${config.app.name}`, (request, response, next) => {
  return response.status(200).json(
      {status: 200, success: true, message: `Welcome to the ${config.app.name}`});
});

router.post(`/${config.app.name}/authorize`, account.authorize);
router.post(`/${config.app.name}/register`, account.register);
router.delete(`/${config.app.name}/unregister`, account.unregister);

router.all(`/${config.app.name}/*`, [authMiddleware]);

router.use((request, response, next) => {
  response.status(404).json(
      {status: 404, success: false, message: '404 not found'});
  next();
});

router.use((err, request, response, next) => {
  console.log(err.message);
  response.status(500).json(
      {status: 500, success: false, message: 'Internal server error'});
  process.exit(1);
});

export {router};