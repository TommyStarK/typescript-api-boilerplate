import { ValidationError, validateOrReject } from 'class-validator';
import { Request, Response, NextFunction } from 'express';

type ExpressMiddleware = (request: Request, response: Response, next: NextFunction) => Promise<void>;
type ModelCtor<T extends Model<T>> = new (json?: object) => T;
type ValidationSetupMiddleware<T> = (request: Request, model: ModelCtor<T>) => void;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
class Model<T> {
  constructor(json?: object) {
    if (typeof json === 'object') {
      Object.assign(this, json);
    }
  }
}

const validationErrorsPrettier = (errors: ValidationError[]): string => errors
  .map((e) => `${e.constraints[Object.keys(e.constraints)[0]]}`).join('\n');

const defaultValidationMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await validateOrReject(req.body, {
      validationError: {
        target: false,
        value: false,
        property: true,
        children: false,
        constraints: true,
      },
    });
    next();
  } catch (errors) {
    res.status(422).json({ status: 422, message: validationErrorsPrettier(errors) });
  }
};

const defaultSetupMiddleware = <T>(request: Request, model: ModelCtor<T>) => {
  // eslint-disable-next-line new-cap
  request.body = new model(request.body);
};

const validate = <T>(
  model: ModelCtor<T>,
  validation?: ExpressMiddleware,
  setup?: ValidationSetupMiddleware<T>,
): ExpressMiddleware => {
  const validationMiddleware = validation || defaultValidationMiddleware;
  const setupMiddleware = setup || defaultSetupMiddleware;
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    setupMiddleware(req, model);
    return validationMiddleware(req, res, next);
  };
};

export {
  ExpressMiddleware,
  Model,
  ModelCtor,
  ValidationSetupMiddleware,
  validate,
  validationErrorsPrettier,
};
