import { Container } from 'inversify';

import { UserController, UserService } from '@app/components/user';
import TYPES from '@app/IoC/types';

const UserContainer = new Container();
UserContainer.bind<UserService>(TYPES.UserService).toService(UserService);
UserContainer.bind<UserController>(TYPES.UserController).to(UserController);

Object.seal(UserContainer);

export default UserContainer;
