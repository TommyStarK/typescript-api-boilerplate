import { IsString } from 'class-validator';

import { AuthPayload } from '@app/components/user/model';
import { ExpressMiddleware, Model, validate } from '@app/middlewares/validators/handler';

class AuthPayloadClass extends Model<AuthPayload> {
  @IsString()
  username!: string;

  @IsString()
  password!: string;
}

export const authPayloadValidator = (): ExpressMiddleware => validate<AuthPayloadClass>(AuthPayloadClass);
