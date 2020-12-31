import { Container } from 'inversify';

import { MediaController } from '@app/components/media/controller';
import { MediaService } from '@app/components/media/service';
import TYPES from '@app/IoC/types';

const MediaContainer = new Container();
MediaContainer.bind<MediaController>(TYPES.MediaController).to(MediaController);
MediaContainer.bind<MediaService>(TYPES.MediaService).to(MediaService);
Object.seal(MediaContainer);

export default MediaContainer;
