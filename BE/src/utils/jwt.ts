import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export type TokenPayload = {
  sub: string;
  role: 'user' | 'admin';
};

export const signAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, { expiresIn: env.ACCESS_TOKEN_TTL });
};

export const signRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, { expiresIn: env.REFRESH_TOKEN_TTL });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as TokenPayload;
};