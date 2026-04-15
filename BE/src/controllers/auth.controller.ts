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
    message: 'Sign up successful',
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
    message: 'Sign in successful',
    data: {
      user: result.user,
    },
  });
});

export const signOutController = asyncHandler(async (_req: Request, res: Response) => {
  clearAuthCookies(res);
  res.status(200).json({
    success: true,
    message: 'Signed out successfully',
  });
});

export const getMeController = asyncHandler(async (req: Request, res: Response) => {
  const authUser = req.user as { id: string; role: 'user' | 'admin' } | undefined;

  if (!authUser?.id) {
    throw new AppError(401, 'UNAUTHORIZED', 'Missing user context');
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
    throw new AppError(401, 'UNAUTHORIZED', 'Missing refresh token');
  }

  const result = await refreshAuth(refreshToken);
  setAuthCookies(res, result.accessToken, result.refreshToken);

  res.status(200).json({
    success: true,
    message: 'Token refreshed',
    data: {
      user: result.user,
    },
  });
});

export const forgotPasswordController = asyncHandler(async (req: Request, res: Response) => {
  const result = await forgotPassword(req.body.email);

  res.status(200).json({
    success: true,
    message: 'If the email exists, a reset link has been generated',
    data: result,
  });
});

export const resetPasswordController = asyncHandler(async (req: Request, res: Response) => {
  await resetPassword(req.body.token, req.body.password);
  res.status(200).json({
    success: true,
    message: 'Password reset successfully',
  });
});

export const verifyEmailController = asyncHandler(async (req: Request, res: Response) => {
  const token = req.query.token as string;
  await verifyEmail(token);

  res.status(200).json({
    success: true,
    message: 'Email verified successfully',
  });
});

export const googleAuthCallbackController = asyncHandler(async (req: Request, res: Response) => {
  if (!googleOAuthEnabled) {
    throw new AppError(503, 'GOOGLE_AUTH_NOT_CONFIGURED', 'Google authentication is not configured');
  }

  const googleUser = req.user as GoogleAuthUser | undefined;
  if (!googleUser?.id) {
    throw new AppError(401, 'UNAUTHORIZED', 'Google authentication failed');
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
      message: 'Google authentication is not configured on the server',
    },
  });
});

export const uploadAvatarController = asyncHandler(async (req: Request, res: Response) => {
  const authUser = req.user as { id: string; role: 'user' | 'admin' } | undefined;

  if (!authUser?.id) {
    throw new AppError(401, 'UNAUTHORIZED', 'Missing user context');
  }

  if (!req.file) {
    throw new AppError(400, 'AVATAR_REQUIRED', 'Avatar image file is required');
  }

  const user = await updateUserAvatar(authUser.id, req.file);

  res.status(200).json({
    success: true,
    message: 'Avatar updated successfully',
    data: {
      user,
    },
  });
});