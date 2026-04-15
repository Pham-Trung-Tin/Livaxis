import type { NextFunction, Request, Response } from 'express';
import { ROLES, type UserRole, Permission, hasAllPermissions, hasAnyPermission, hasPermission } from '../constants/roles';
import { AppError } from '../utils/appError';

const getAuthenticatedRole = (req: Request): UserRole | undefined => {
  return req.user?.role;
};

export const checkRole = (allowedRole: UserRole) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const role = getAuthenticatedRole(req);

    if (!role) {
      next(new AppError(401, 'UNAUTHORIZED', 'Missing user context'));
      return;
    }

    if (role !== allowedRole) {
      next(new AppError(403, 'FORBIDDEN', 'You do not have permission to perform this action'));
      return;
    }

    next();
  };
};

export const checkPermission = (permission: Permission) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const role = getAuthenticatedRole(req);

    if (!role) {
      next(new AppError(401, 'UNAUTHORIZED', 'Missing user context'));
      return;
    }

    if (!hasPermission(role, permission)) {
      next(new AppError(403, 'FORBIDDEN', 'You do not have permission to perform this action'));
      return;
    }

    next();
  };
};

export const checkAnyPermission = (permissions: Permission[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const role = getAuthenticatedRole(req);

    if (!role) {
      next(new AppError(401, 'UNAUTHORIZED', 'Missing user context'));
      return;
    }

    if (!hasAnyPermission(role, permissions)) {
      next(new AppError(403, 'FORBIDDEN', 'You do not have permission to perform this action'));
      return;
    }

    next();
  };
};

export const checkAllPermissions = (permissions: Permission[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const role = getAuthenticatedRole(req);

    if (!role) {
      next(new AppError(401, 'UNAUTHORIZED', 'Missing user context'));
      return;
    }

    if (!hasAllPermissions(role, permissions)) {
      next(new AppError(403, 'FORBIDDEN', 'You do not have permission to perform this action'));
      return;
    }

    next();
  };
};

export { ROLES };
