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
      next(new AppError(401, 'UNAUTHORIZED', 'Thiếu thông tin người dùng'));
      return;
    }

    if (role !== allowedRole) {
      next(new AppError(403, 'FORBIDDEN', 'Bạn không có quyền thực hiện hành động này'));
      return;
    }

    next();
  };
};

export const checkPermission = (permission: Permission) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const role = getAuthenticatedRole(req);

    if (!role) {
      next(new AppError(401, 'UNAUTHORIZED', 'Thiếu thông tin người dùng'));
      return;
    }

    if (!hasPermission(role, permission)) {
      next(new AppError(403, 'FORBIDDEN', 'Bạn không có quyền thực hiện hành động này'));
      return;
    }

    next();
  };
};

export const checkAnyPermission = (permissions: Permission[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const role = getAuthenticatedRole(req);

    if (!role) {
      next(new AppError(401, 'UNAUTHORIZED', 'Thiếu thông tin người dùng'));
      return;
    }

    if (!hasAnyPermission(role, permissions)) {
      next(new AppError(403, 'FORBIDDEN', 'Bạn không có quyền thực hiện hành động này'));
      return;
    }

    next();
  };
};

export const checkAllPermissions = (permissions: Permission[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const role = getAuthenticatedRole(req);

    if (!role) {
      next(new AppError(401, 'UNAUTHORIZED', 'Thiếu thông tin người dùng'));
      return;
    }

    if (!hasAllPermissions(role, permissions)) {
      next(new AppError(403, 'FORBIDDEN', 'Bạn không có quyền thực hiện hành động này'));
      return;
    }

    next();
  };
};

export { ROLES };
