import { Container } from 'inversify';

import { MediaController, MediaService } from '@app/components/media';
import TYPES from '@app/IoC/types';

const MediaContainer = new Container();
MediaContainer.bind<MediaService>(TYPES.MediaService).to(MediaService);
MediaContainer.bind<MediaController>(TYPES.MediaController).to(MediaController);
Object.seal(MediaContainer);

export default MediaContainer;
