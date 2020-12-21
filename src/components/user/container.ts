import { Container } from 'inversify';

import IoCUser from '@app/components/user/symbol';
import { UserController, UserService } from '@app/components/user';

const IoCUserContainer = new Container();
IoCUserContainer.bind<UserService>(IoCUser.ServiceIdentifier).to(UserService);
IoCUserContainer.bind<UserController>(IoCUser.ControllerIdentifier).to(UserController);

Object.seal(IoCUserContainer);
console.log('service is bound', IoCUserContainer.isBound(IoCUser.ServiceIdentifier));
console.log('controller is bound', IoCUserContainer.isBound(IoCUser.ControllerIdentifier));

export default IoCUserContainer;
