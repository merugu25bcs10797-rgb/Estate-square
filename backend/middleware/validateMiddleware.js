import mongoose from 'mongoose';
import { AppError } from './errorMiddleware.js';

export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const issues = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        return next(new AppError(`Validation failed: ${issues.join('; ')}`, 400, issues));
      }
      return next(new AppError(err.message, 400));
    }
  };
};

export const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError(`Invalid ObjectId parameter: '${paramName}'`, 400));
    }
    next();
  };
};
