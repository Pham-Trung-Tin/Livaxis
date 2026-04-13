import type { Response } from 'express';
import { env, isProduction } from '../config/env';

const accessTokenMaxAge = 15 * 60 * 1000;
const refreshTokenMaxAge = 7 * 24 * 60 * 60 * 1000;

const baseCookieOptions = {
  httpOnly: true,
  secure: env.COOKIE_SECURE || isProduction,
  sameSite: 'lax' as const,
  domain: env.COOKIE_DOMAIN,
  path: '/',
};

export const setAuthCookies = (res: Response, accessToken: string, refreshToken: string): void => {
  res.cookie('accessToken', accessToken, { ...baseCookieOptions, maxAge: accessTokenMaxAge });
  res.cookie('refreshToken', refreshToken, { ...baseCookieOptions, maxAge: refreshTokenMaxAge });
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie('accessToken', baseCookieOptions);
  res.clearCookie('refreshToken', baseCookieOptions);
};