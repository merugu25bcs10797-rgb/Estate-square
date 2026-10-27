import { AppError } from './errorMiddleware.js';

export const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          `Access forbidden: Your role (${req.user?.role || 'anonymous'}) is not authorized to perform this action.`,
          403
        )
      );
    }
    next();
  };
};
