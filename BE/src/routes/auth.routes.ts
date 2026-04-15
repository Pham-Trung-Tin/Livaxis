import { Router } from 'express';
import passport from 'passport';
import {
  forgotPasswordController,
  getMeController,
  googleAuthCallbackController,
  googleAuthNotConfiguredController,
  refreshController,
  resetPasswordController,
  signInController,
  signOutController,
  signUpController,
  uploadAvatarController,
  verifyEmailController,
} from '../controllers/auth.controller';
import { env } from '../config/env';
import { googleOAuthEnabled } from '../config/passport';
import { authenticate } from '../middlewares/auth.middleware';
import { loginLimiter } from '../middlewares/rateLimit.middleware';
import { avatarUpload } from '../middlewares/upload.middleware';
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
authRouter.patch('/avatar', authenticate, avatarUpload.single('avatar'), uploadAvatarController);
authRouter.post('/refresh', refreshController);
authRouter.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPasswordController);
authRouter.post('/reset-password', validateRequest(resetPasswordSchema), resetPasswordController);
authRouter.get('/verify-email', validateRequest(verifyEmailSchema), verifyEmailController);

if (googleOAuthEnabled) {
  authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
  authRouter.get(
    '/google/callback',
    passport.authenticate('google', {
      session: false,
      failureRedirect: `${env.CLIENT_URL}/sign-in?social=google&status=failed`,
    }),
    googleAuthCallbackController,
  );
} else {
  authRouter.get('/google', googleAuthNotConfiguredController);
  authRouter.get('/google/callback', googleAuthNotConfiguredController);
}

export { authRouter };