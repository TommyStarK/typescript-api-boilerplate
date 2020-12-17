import 'reflect-metadata';
import { Container } from 'inversify';

import IoCUser from '@app/components/user/symbol';
import { UserController, UserService } from '@app/components/user';

const IoCUserContainer = new Container();
IoCUserContainer.bind<UserController>(IoCUser.ControllerIdentifier).to(UserController);
IoCUserContainer.bind<UserService>(IoCUser.ServiceIdentifier).to(UserService);
Object.seal(IoCUserContainer);

export default IoCUserContainer;
