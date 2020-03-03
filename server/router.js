import express from 'express';
import multer from 'multer';

import authMiddleware from './authentication';
import config from './config';
import { mediaAPI, userAPI } from './components';

const router = new express.Router();
const upload = multer({ dest: '.uploads/' });

// tiny async handler for express midlleware
// http://expressjs.com/en/advanced/best-practice-performance.html#handle-exceptions-properly
const asyncWrapper = fn => (...args) => fn(...args).catch(args[2]);

// First path handled
router.get(`/${config.app.url}`, (_, response) => response.status(200).json({
  status: 200,
  message: `Welcome to the ${config.app.name}`,
}));

// Account management
router.post(`/${config.app.url}/authorize`, asyncWrapper(userAPI.authorize));
router.post(`/${config.app.url}/register`, asyncWrapper(userAPI.register));
router.delete(`/${config.app.url}/unregister`, asyncWrapper(userAPI.unregister));

// authentication middleware
router.all(`/${config.app.url}/*`, [authMiddleware]);

router.get(`/${config.app.url}/hello`, (request, response) => {
  response.status(200).json({ status: 200, message: `Hello ${request.decoded.username}` });
});

// Media
router.get(`/${config.app.url}/pictures`, asyncWrapper(mediaAPI.getPictures));
router.get(`/${config.app.url}/picture/:id`, asyncWrapper(mediaAPI.getPicture));
router.post(`/${config.app.url}/picture`, upload.single('file'), asyncWrapper(mediaAPI.uploadNewPicture));
router.delete(`/${config.app.url}/picture/:id`, asyncWrapper(mediaAPI.deletePicture));

// 404 not found middleware
router.use((_, response, next) => {
  response.status(404).json({ status: 404, message: '404 not found' });
  next();
});

// 500 Internal server error middleware
router.use((err, _, response, next) => {
  response.status(500).json({ status: 500, message: 'Internal server error' });
  next();
});

export default router;
