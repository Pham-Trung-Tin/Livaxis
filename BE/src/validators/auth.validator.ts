import { z } from 'zod';

export const signUpSchema = z
  .object({
    body: z.object({
      username: z.string().trim().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự').max(30),
      name: z.string().trim().min(2, 'Họ và tên phải có ít nhất 2 ký tự').max(50),
      email: z.email('Email không hợp lệ').transform((value) => value.toLowerCase()),
      phone: z.string().trim().optional(),
      password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').max(72),
      confirmPassword: z.string().min(6),
    }),
  })
  .refine((data) => data.body.password === data.body.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['body', 'confirmPassword'],
  });

export const signInSchema = z.object({
  body: z.object({
    username: z.string().trim().min(3, 'Vui lòng nhập tên đăng nhập hoặc email').max(100),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').max(72),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.email('Email không hợp lệ').transform((value) => value.toLowerCase()),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(8),
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').max(72),
  }),
});

export const verifyEmailSchema = z.object({
  query: z.object({
    token: z.string().min(8),
  }),
});