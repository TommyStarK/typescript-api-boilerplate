import express, { NextFunction, Request, Response } from 'express';
import multer from 'multer';

import config from '@app/config';
// import IoCMedia from '@app/components/media/symbol';
// import IoCMediaContainer from '@app/components/media/container';
// import { MediaController } from '@app/components/media';
import IoCUser from '@app/components/user/symbol';
import IoCUserContainer from '@app/components/user/container';
import { UserController } from '@app/components/user';
import { authMiddleware, errorMiddleware, notfoundMiddleware } from '@app/middlewares';

const router = express.Router();
const upload = multer({ dest: '.uploads/' });
console.log(upload);

const asyncWrapper = (fn: any) => (request: Request, response: Response, next: NextFunction) => {
  Promise.resolve(fn(request, response, next)).catch(next);
};

// const mediaController: MediaController = IoCMediaContainer.get<MediaController>(IoCMedia.ControllerIdentifier);
const userController: UserController = IoCUserContainer.get<UserController>(IoCUser.ControllerIdentifier);
console.log('is bound', IoCUserContainer.isBound(IoCUser.ControllerIdentifier));

// First path handled
router.get(`/${config.app.url}`, (_: Request, response: Response) => response.status(200).json({
  status: 200,
  message: `Welcome to the ${config.app.name}`,
}));

// Account management
router.post(`/${config.app.url}/authorize`, asyncWrapper(userController.authorize));
router.post(`/${config.app.url}/register`, asyncWrapper(userController.register));
router.delete(`/${config.app.url}/unregister`, asyncWrapper(userController.unregister));

// authentication middleware
router.all(`/${config.app.url}/*`, [authMiddleware]);

router.get(`/${config.app.url}/hello`, (request: Request, response: Response) => {
  response.status(200).json({ status: 200, message: `Hello ${request.decoded.username}` });
});

// Media
// router.get(`/${config.app.url}/pictures`, asyncWrapper(mediaController.getPictures));
// router.get(`/${config.app.url}/picture/:id`, asyncWrapper(mediaController.getPicture));
// router.post(`/${config.app.url}/picture`, upload.single('file'), asyncWrapper(mediaController.uploadNewPicture));
// router.delete(`/${config.app.url}/picture/:id`, asyncWrapper(mediaController.deletePicture));

router.use(notfoundMiddleware);
router.use(errorMiddleware);

export default router;
