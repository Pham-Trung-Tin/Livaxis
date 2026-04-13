import type { Request, Response } from 'express';
import { AppError } from '../utils/appError';
import { asyncHandler } from '../utils/asyncHandler';
import { clearAuthCookies, setAuthCookies } from '../utils/cookie';
import {
  forgotPassword,
  getCurrentUser,
  login,
  refreshAuth,
  register,
  resetPassword,
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
  if (!req.user?.id) {
    throw new AppError(401, 'UNAUTHORIZED', 'Missing user context');
  }

  const user = await getCurrentUser(req.user.id);
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

export const socialLoginPlaceholderController = asyncHandler(async (req: Request, res: Response) => {
  const provider = req.params.provider;

  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: `Social login for ${provider} is not implemented yet`,
    },
  });
});