import { Request, Response } from 'express';
import { injectable, inject } from 'inversify';

import { UserOpResult } from '@app/types';
import { UserService } from '@app/components/user';
import TYPES from '@app/IoC/types';

@injectable()
export class UserController {
  constructor(@inject(TYPES.UserService) private userService: UserService) {}

  public async authorize(request: Request, response: Response): Promise<void> {
    const auth: UserOpResult = await this.userService.authenticate(request.body);
    response.status(auth.status).json(auth);
  }

  public async register(request: Request, response: Response): Promise<void> {
    const registration: UserOpResult = await this.userService.create(request.body);
    response.status(registration.status).json(registration);
  }

  public async unregister(request: Request, response: Response): Promise<void> {
    const unregistration: UserOpResult = await this.userService.delete(request.body);
    response.status(unregistration.status).json(unregistration);
  }
}
