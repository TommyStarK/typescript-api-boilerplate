import { Container } from 'inversify';

import { UserController, UserService } from '@app/components/user';

const IoCUser = {
  ControllerIdentifier: Symbol.for('UserController'),
  ServiceIdentifier: Symbol.for('UserService'),
};

Object.seal(IoCUser);

const UserContainer = new Container();
UserContainer.bind<UserService>(IoCUser.ServiceIdentifier).to(UserService);
UserContainer.bind<UserController>(IoCUser.ControllerIdentifier).to(UserController);

Object.seal(UserContainer);

export {
  IoCUser,
  UserContainer,
};
