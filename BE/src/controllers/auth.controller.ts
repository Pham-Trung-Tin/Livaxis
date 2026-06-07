import type { Request, Response } from 'express';
import { AppError } from '../utils/appError';
import { asyncHandler } from '../utils/asyncHandler';
import { env } from '../config/env';
import { clearAuthCookies, setAuthCookies } from '../utils/cookie';
import { googleOAuthEnabled, type GoogleAuthUser } from '../config/passport';
import {
  forgotPassword,
  getCurrentUser,
  login,
  loginWithUserId,
  refreshAuth,
  register,
  resetPassword,
  updateUserAvatar,
  verifyEmail,
} from '../services/auth.service';

export const signUpController = asyncHandler(async (req: Request, res: Response) => {
  const result = await register(req.body);

  setAuthCookies(res, result.accessToken, result.refreshToken);

  res.status(201).json({
    success: true,
    message: 'Đăng ký thành công',
    data: {
      user: result.user,
      verificationToken: result.verificationToken,
    },
  });
});

export const signInController = asyncHandler(async (req: Request, res: Response) => {
  const result = await login(req.body);
  setAuthCookies(res, result.accessToken, result.refreshToken);

  res.status(200).json({
    success: true,
    message: 'Đăng nhập thành công',
    data: {
      user: result.user,
    },
  });
});

export const signOutController = asyncHandler(async (_req: Request, res: Response) => {
  clearAuthCookies(res);
  res.status(200).json({
    success: true,
    message: 'Đăng xuất thành công',
  });
});

export const getMeController = asyncHandler(async (req: Request, res: Response) => {
  const authUser = req.user as { id: string; role: 'user' | 'manager' } | undefined;

  if (!authUser?.id) {
    throw new AppError(401, 'UNAUTHORIZED', 'Thiếu thông tin người dùng');
  }

  const user = await getCurrentUser(authUser.id);
  res.status(200).json({
    success: true,
    data: {
      user,
    },
  });
});

export const refreshController = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    throw new AppError(401, 'UNAUTHORIZED', 'Thiếu mã làm mới (refresh token)');
  }

  const result = await refreshAuth(refreshToken);
  setAuthCookies(res, result.accessToken, result.refreshToken);

  res.status(200).json({
    success: true,
    message: 'Mã xác thực đã được làm mới',
    data: {
      user: result.user,
    },
  });
});

export const forgotPasswordController = asyncHandler(async (req: Request, res: Response) => {
  const result = await forgotPassword(req.body.email);

  res.status(200).json({
    success: true,
    message: 'Nếu email tồn tại trên hệ thống, một liên kết khôi phục mật khẩu đã được gửi',
    data: result,
  });
});

export const resetPasswordController = asyncHandler(async (req: Request, res: Response) => {
  await resetPassword(req.body.token, req.body.password);
  res.status(200).json({
    success: true,
    message: 'Đặt lại mật khẩu thành công',
  });
});

export const verifyEmailController = asyncHandler(async (req: Request, res: Response) => {
  const token = req.query.token as string;
  await verifyEmail(token);

  res.status(200).json({
    success: true,
    message: 'Xác thực email thành công',
  });
});

export const googleAuthCallbackController = asyncHandler(async (req: Request, res: Response) => {
  if (!googleOAuthEnabled) {
    throw new AppError(503, 'GOOGLE_AUTH_NOT_CONFIGURED', 'Đăng nhập bằng Google chưa được cấu hình');
  }

  const googleUser = req.user as GoogleAuthUser | undefined;
  if (!googleUser?.id) {
    throw new AppError(401, 'UNAUTHORIZED', 'Đăng nhập bằng Google thất bại');
  }

  const result = await loginWithUserId(googleUser.id);
  setAuthCookies(res, result.accessToken, result.refreshToken);

  const redirectUrl = new URL('/sign-in', env.CLIENT_URL);
  redirectUrl.searchParams.set('social', 'google');
  redirectUrl.searchParams.set('status', 'success');

  res.redirect(redirectUrl.toString());
});

export const googleAuthNotConfiguredController = asyncHandler(async (_req: Request, res: Response) => {
  res.status(503).json({
    success: false,
    error: {
      code: 'GOOGLE_AUTH_NOT_CONFIGURED',
      message: 'Tính năng đăng nhập bằng Google chưa được cấu hình trên máy chủ',
    },
  });
});

export const uploadAvatarController = asyncHandler(async (req: Request, res: Response) => {
  const authUser = req.user as { id: string; role: 'user' | 'manager' } | undefined;

  if (!authUser?.id) {
    throw new AppError(401, 'UNAUTHORIZED', 'Thiếu thông tin người dùng');
  }

  if (!req.file) {
    throw new AppError(400, 'AVATAR_REQUIRED', 'Vui lòng tải lên tệp ảnh đại diện');
  }

  const user = await updateUserAvatar(authUser.id, req.file);

  res.status(200).json({
    success: true,
    message: 'Cập nhật ảnh đại diện thành công',
    data: {
      user,
    },
  });
});