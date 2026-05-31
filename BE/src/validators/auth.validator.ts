import { z } from 'zod';

export const signUpSchema = z
  .object({
    body: z.object({
      username: z.string().trim().min(3, 'Username must be at least 3 characters').max(30),
      name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50),
      email: z.email('Email is invalid').transform((value) => value.toLowerCase()),
      phone: z.string().trim().optional(),
      password: z.string().min(6, 'Password must be at least 6 characters').max(72),
      confirmPassword: z.string().min(6),
    }),
  })
  .refine((data) => data.body.password === data.body.confirmPassword, {
    message: 'Passwords do not match',
    path: ['body', 'confirmPassword'],
  });

export const signInSchema = z.object({
  body: z.object({
    username: z.string().trim().min(3, 'Username or email is required').max(100),
    password: z.string().min(6, 'Password must be at least 6 characters').max(72),
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
    password: z.string().min(6, 'Password must be at least 6 characters').max(72),
  }),
});

export const verifyEmailSchema = z.object({
  query: z.object({
    token: z.string().min(8),
  }),
});