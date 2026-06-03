import type { NextFunction, Request, Response } from 'express';
import User from '../models/user.model';
import { AppError } from '../utils/appError';
import { verifyAccessToken } from '../utils/jwt';

const extractToken = (req: Request): string | null => {
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return null;
};

export const authenticate = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const token = extractToken(req);
  if (!token) {
    next(new AppError(401, 'UNAUTHORIZED', 'Thiếu mã xác thực (access token)'));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub);

    if (!user || !user.isActive) {
      next(new AppError(401, 'UNAUTHORIZED', 'Không tìm thấy người dùng hoặc tài khoản đã bị khóa'));
      return;
    }

    req.user = {
      id: user._id.toString(),
      role: user.role,
    };

    next();
  } catch {
    next(new AppError(401, 'UNAUTHORIZED', 'Mã xác thực không hợp lệ hoặc đã hết hạn'));
  }
};
