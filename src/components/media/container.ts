import 'reflect-metadata';
import { Container } from 'inversify';

import { MediaController, MediaService } from '@app/components/media';
import IoCMedia from '@app/components/media/symbol';

const IoCMediaContainer = new Container();
IoCMediaContainer.bind<MediaController>(IoCMedia.ControllerIdentifier).to(MediaController);
IoCMediaContainer.bind<MediaService>(IoCMedia.ServiceIdentifier).to(MediaService);
Object.seal(IoCMediaContainer);

export default IoCMediaContainer;
