import { Container } from 'inversify';

import { MediaController, MediaService } from '@app/components/media';

const IoCMedia = {
  ControllerIdentifier: Symbol.for('MediaController'),
  ServiceIdentifier: Symbol.for('MediaService'),
};

Object.seal(IoCMedia);

const MediaContainer = new Container();
MediaContainer.bind<MediaService>(IoCMedia.ServiceIdentifier).to(MediaService);
MediaContainer.bind<MediaController>(IoCMedia.ControllerIdentifier).to(MediaController);
Object.seal(MediaContainer);

export {
  IoCMedia,
  MediaContainer,
};
