import { Container } from 'inversify';

import IoCMedia from '@app/components/media/symbol';
import { MediaController, MediaService } from '@app/components/media';

const IoCMediaContainer = new Container();
IoCMediaContainer.bind<MediaController>(IoCMedia.ControllerIdentifier).to(MediaController);
IoCMediaContainer.bind<MediaService>(IoCMedia.ServiceIdentifier).to(MediaService);
Object.seal(IoCMediaContainer);

export default IoCMediaContainer;
