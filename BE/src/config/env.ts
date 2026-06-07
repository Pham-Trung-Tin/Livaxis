// Environment variables are loaded from .env file via dotenv in server.ts
// This file provides typed access to process.env variables with parsing and validation
import dotenv from 'dotenv';


dotenv.config();


const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};


const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};


const parseOrigins = (value: string | undefined): string[] => {
  if (!value) {
    return ['http://localhost:5173'];
  }
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};


export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: parseNumber(process.env.PORT, 5000),
  MONGODB_URI: requireEnv('MONGODB_URI'),
  DB_NAME: process.env.DB_NAME ?? 'livaxis',
  CORS_ORIGINS: parseOrigins(process.env.CORS_ORIGINS),
  ACCESS_TOKEN_SECRET: requireEnv('ACCESS_TOKEN_SECRET'),
  REFRESH_TOKEN_SECRET: requireEnv('REFRESH_TOKEN_SECRET'),
  ACCESS_TOKEN_TTL: process.env.ACCESS_TOKEN_TTL ?? '15m',
  REFRESH_TOKEN_TTL: process.env.REFRESH_TOKEN_TTL ?? '7d',
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
  COOKIE_SECURE: process.env.COOKIE_SECURE === 'true',
  CLIENT_URL: process.env.CLIENT_URL ?? 'http://localhost:5173',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  AI_IMAGE_PROVIDER: process.env.AI_IMAGE_PROVIDER,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
  GEMINI_IMAGE_MODEL: process.env.GEMINI_IMAGE_MODEL,
  STABILITY_API_KEY: process.env.STABILITY_API_KEY,
  REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,
  REPLICATE_MODEL: process.env.REPLICATE_MODEL,
  REPLICATE_MODEL_VERSION: process.env.REPLICATE_MODEL_VERSION,
  REPLICATE_IMAGE_FIELD: process.env.REPLICATE_IMAGE_FIELD,
  REPLICATE_PROMPT_FIELD: process.env.REPLICATE_PROMPT_FIELD,
  // SePay
  SEPAY_WEBHOOK_API_KEY: process.env.SEPAY_WEBHOOK_API_KEY ?? '',
  SEPAY_API_TOKEN: process.env.SEPAY_API_TOKEN ?? '',
  BANK_ID: process.env.BANK_ID ?? '970423',
  BANK_ACCOUNT_NUMBER: process.env.BANK_ACCOUNT_NUMBER ?? '',
  BANK_ACCOUNT_NAME: process.env.BANK_ACCOUNT_NAME ?? '',
  BANK_SHORT_NAME: process.env.BANK_SHORT_NAME ?? 'TPBank',
};


export const isProduction = env.NODE_ENV === 'production';



