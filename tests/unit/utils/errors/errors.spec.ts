import {
  UnauthorizedError,
  NotFoundError,
  LogicError,
  ForbiddenError,
  ConflictError,
  UnsupportedMediaTypeError,
  UnprocessableEntityError,
  NotImplementedError,
} from '@app/utils/errors';

describe('errors utils', () => {
  test('default', () => {
    expect(() => { throw new UnauthorizedError(); }).toThrow('unauthorized');
    expect(() => { throw new NotFoundError(); }).toThrow('resource not found');
    expect(() => { throw new LogicError(); }).toThrow('logic error');
    expect(() => { throw new ForbiddenError(); }).toThrow('forbidden');
    expect(() => { throw new ConflictError(); }).toThrow('conflict');
    expect(() => { throw new UnsupportedMediaTypeError(); }).toThrow('unsupported media type');
    expect(() => { throw new UnprocessableEntityError(); }).toThrow('unprocessable entity');
    expect(() => { throw new NotImplementedError(); }).toThrow('not implemented');
  });
});
