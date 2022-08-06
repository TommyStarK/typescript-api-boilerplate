import { IsEmail, IsString } from 'class-validator';

import { RegistrationPayload } from '@app/api/user/model';

import {
  ExpressMiddleware,
  Model,
  validate,
} from '@app/middlewares/validators/handler';

class RegistrationPayloadClass extends Model<RegistrationPayload> {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsString()
  @IsEmail()
  email: string;
}

// eslint-disable-next-line max-len
export const registrationPayloadValidator = (): ExpressMiddleware => validate<RegistrationPayloadClass>(RegistrationPayloadClass);
