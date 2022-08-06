import { IsString, MinLength } from 'class-validator';
import { Request } from 'express';

import { MongoID } from '@app/api/media/model';

import {
  ExpressMiddleware,
  Model,
  ModelCtor,
  validate,
} from '@app/middlewares/validators';

class MongoIDvalidationClass extends Model<MongoID> {
  @IsString()
  @MinLength(12, {
    message: 'picture ID must be a single string of either 12 bytes or 24 hex characters',
  })
  id: string;
}

const customtSetupMiddleware = <T>(request: Request, model: ModelCtor<T>) => {
  const { id } = request.params;
  // eslint-disable-next-line new-cap
  request.body = new model({ id });
};

export const mongoIDValidator = (): ExpressMiddleware => validate<MongoIDvalidationClass>(
  MongoIDvalidationClass,
  undefined,
  customtSetupMiddleware,
);
