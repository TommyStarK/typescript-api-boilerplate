import { Container } from 'inversify';

import { UserController } from '@app/components/user/controller';
import { UserService } from '@app/components/user/service';
import TYPES from '@app/IoC/types';

const UserContainer = new Container();
UserContainer.bind<UserController>(TYPES.UserController).to(UserController);
UserContainer.bind<UserService>(TYPES.UserService).to(UserService);

Object.seal(UserContainer);

export default UserContainer;
