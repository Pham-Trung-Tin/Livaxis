import { Router } from 'express';
import {
  forgotPasswordController,
  getMeController,
  refreshController,
  resetPasswordController,
  socialLoginPlaceholderController,
  signInController,
  signOutController,
  signUpController,
  verifyEmailController,
} from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { loginLimiter } from '../middlewares/rateLimit.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  verifyEmailSchema,
} from '../validators/auth.validator';

const authRouter = Router();

authRouter.post('/signup', validateRequest(signUpSchema), signUpController);
authRouter.post('/signin', loginLimiter, validateRequest(signInSchema), signInController);
authRouter.post('/signout', signOutController);
authRouter.get('/me', authenticate, getMeController);
authRouter.post('/refresh', refreshController);
authRouter.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPasswordController);
authRouter.post('/reset-password', validateRequest(resetPasswordSchema), resetPasswordController);
authRouter.get('/verify-email', validateRequest(verifyEmailSchema), verifyEmailController);
authRouter.post('/social/:provider', socialLoginPlaceholderController);

export { authRouter };