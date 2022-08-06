/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */

export class LogicError extends Error {
  constructor(message = 'logic error') {
    super(message);
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'unauthorized') {
    super(message);
  }
}

export class ForbiddenError extends Error {
  constructor(message = 'forbidden') {
    super(message);
  }
}

export class NotFoundError extends Error {
  constructor(message = 'resource not found') {
    super(message);
  }
}

export class ConflictError extends Error {
  constructor(message = 'conflict') {
    super(message);
  }
}

export class UnsupportedMediaTypeError extends Error {
  constructor(message = 'unsupported media type') {
    super(message);
  }
}

export class UnprocessableEntityError extends Error {
  constructor(message = 'unprocessable entity') {
    super(message);
  }
}

export class NotImplementedError extends Error {
  constructor(message = 'not implemented') {
    super(message);
  }
}
