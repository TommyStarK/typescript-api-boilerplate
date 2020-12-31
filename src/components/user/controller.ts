import { Request, Response } from 'express';
// import { injectable, inject } from 'inversify';

// import { IoCUser, UserService } from '@app/components/user';
import { UserService } from '@app/components/user';

// @injectable()
export class UserController {
  private userService: UserService;

  // constructor(@inject(IoCUser.ServiceIdentifier) private userService: UserService) {}
  constructor(userService: UserService) {
    this.userService = userService;
  }

  public async authorize(request: Request, response: Response): Promise<void> {
    const auth = await this.userService.authenticate(request.body);
    response.status(auth.status).json(auth);
  }

  public async register(request: Request, response: Response): Promise<void> {
    const registration = await this.userService.create(request.body);
    response.status(registration.status).json(registration);
  }

  public async unregister(request: Request, response: Response): Promise<void> {
    const unregistration = await this.userService.delete(request.body);
    response.status(unregistration.status).json(unregistration);
  }
}
