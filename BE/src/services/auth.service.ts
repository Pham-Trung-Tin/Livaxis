import bcrypt from 'bcrypt';
import User, { type IUser } from '../models/user.model';
import { AppError } from '../utils/appError';
import { createRandomToken, hashToken } from '../utils/crypto';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';

type SignUpInput = {
  name: string;
  email: string;
  password: string;
};

type SignInInput = {
  email: string;
  password: string;
};

export type UserPublic = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const toPublicUser = (user: IUser): UserPublic => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  isActive: user.isActive,
  emailVerified: user.emailVerified,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const buildTokens = (user: IUser): { accessToken: string; refreshToken: string } => {
  const payload = {
    sub: user._id.toString(),
    role: user.role,
  };

  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
};

export const register = async (input: SignUpInput): Promise<{
  user: UserPublic;
  accessToken: string;
  refreshToken: string;
  verificationToken?: string;
}> => {
  const existed = await User.findOne({ email: input.email });
  if (existed) {
    throw new AppError(409, 'EMAIL_EXISTS', 'Email is already registered');
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const verificationToken = createRandomToken();

  const user = await User.create({
    name: input.name,
    email: input.email,
    passwordHash,
    role: 'user',
    emailVerificationTokenHash: hashToken(verificationToken),
    emailVerificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  const { accessToken, refreshToken } = buildTokens(user);
  return {
    user: toPublicUser(user),
    accessToken,
    refreshToken,
    verificationToken: process.env.NODE_ENV === 'production' ? undefined : verificationToken,
  };
};

export const login = async (input: SignInInput): Promise<{
  user: UserPublic;
  accessToken: string;
  refreshToken: string;
}> => {
  const user = await User.findOne({ email: input.email }).select('+passwordHash');
  if (!user) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
  }

  if (!user.isActive) {
    throw new AppError(403, 'ACCOUNT_INACTIVE', 'Your account has been disabled');
  }

  const isMatched = await bcrypt.compare(input.password, user.passwordHash);
  if (!isMatched) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
  }

  const { accessToken, refreshToken } = buildTokens(user);
  return {
    user: toPublicUser(user),
    accessToken,
    refreshToken,
  };
};

export const loginWithUserId = async (userId: string): Promise<{
  user: UserPublic;
  accessToken: string;
  refreshToken: string;
}> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(401, 'UNAUTHORIZED', 'User not found or unauthorized');
  }

  if (!user.isActive) {
    throw new AppError(403, 'ACCOUNT_INACTIVE', 'Your account has been disabled');
  }

  const { accessToken, refreshToken } = buildTokens(user);
  return {
    user: toPublicUser(user),
    accessToken,
    refreshToken,
  };
};

export const getCurrentUser = async (userId: string): Promise<UserPublic> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(401, 'UNAUTHORIZED', 'User not found or unauthorized');
  }

  if (!user.isActive) {
    throw new AppError(403, 'ACCOUNT_INACTIVE', 'Your account has been disabled');
  }

  return toPublicUser(user);
};

export const refreshAuth = async (refreshToken: string): Promise<{
  user: UserPublic;
  accessToken: string;
  refreshToken: string;
}> => {
  const payload = verifyRefreshToken(refreshToken);
  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid refresh token');
  }

  const tokens = buildTokens(user);
  return {
    user: toPublicUser(user),
    ...tokens,
  };
};

export const forgotPassword = async (email: string): Promise<{ resetToken?: string }> => {
  const user = await User.findOne({ email }).select('+passwordResetTokenHash +passwordResetExpiresAt');

  if (!user) {
    return {};
  }

  const resetToken = createRandomToken();
  user.passwordResetTokenHash = hashToken(resetToken);
  user.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  return {
    resetToken: process.env.NODE_ENV === 'production' ? undefined : resetToken,
  };
};

export const resetPassword = async (token: string, password: string): Promise<void> => {
  const tokenHash = hashToken(token);

  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: { $gt: new Date() },
  }).select('+passwordResetTokenHash +passwordResetExpiresAt +passwordHash');

  if (!user) {
    throw new AppError(400, 'INVALID_OR_EXPIRED_TOKEN', 'Reset token is invalid or expired');
  }

  user.passwordHash = await bcrypt.hash(password, 12);
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpiresAt = undefined;
  await user.save();
};

export const verifyEmail = async (token: string): Promise<void> => {
  const tokenHash = hashToken(token);

  const user = await User.findOne({
    emailVerificationTokenHash: tokenHash,
    emailVerificationExpiresAt: { $gt: new Date() },
  }).select('+emailVerificationTokenHash +emailVerificationExpiresAt');

  if (!user) {
    throw new AppError(400, 'INVALID_OR_EXPIRED_TOKEN', 'Verification token is invalid or expired');
  }

  user.emailVerified = true;
  user.emailVerificationTokenHash = undefined;
  user.emailVerificationExpiresAt = undefined;
  await user.save();
};