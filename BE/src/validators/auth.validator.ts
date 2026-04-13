import { z } from 'zod';

export const signUpSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50),
    email: z.email('Email is invalid').transform((value) => value.toLowerCase()),
    password: z.string().min(8, 'Password must be at least 8 characters').max(72),
  }),
});

export const signInSchema = z.object({
  body: z.object({
    email: z.email('Email is invalid').transform((value) => value.toLowerCase()),
    password: z.string().min(8, 'Password must be at least 8 characters').max(72),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.email('Email is invalid').transform((value) => value.toLowerCase()),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(8),
    password: z.string().min(8, 'Password must be at least 8 characters').max(72),
  }),
});

export const verifyEmailSchema = z.object({
  query: z.object({
    token: z.string().min(8),
  }),
});