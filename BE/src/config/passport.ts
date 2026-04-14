import crypto from 'crypto';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { Strategy as GoogleStrategy, type Profile } from 'passport-google-oauth20';
import { env } from './env';
import User from '../models/user.model';

export type GoogleAuthUser = {
  id: string;
  role: 'user' | 'admin';
};

export const googleOAuthEnabled = Boolean(
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET && env.GOOGLE_CALLBACK_URL,
);

let strategyInitialized = false;

const resolveDisplayName = (profile: Profile, email: string): string => {
  if (profile.displayName?.trim()) {
    return profile.displayName.trim();
  }

  const givenName = profile.name?.givenName?.trim();
  const familyName = profile.name?.familyName?.trim();
  const fromProfile = [givenName, familyName].filter(Boolean).join(' ').trim();
  if (fromProfile) {
    return fromProfile;
  }

  return email.split('@')[0];
};

export const configurePassport = (): void => {
  if (strategyInitialized || !googleOAuthEnabled) {
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID as string,
        clientSecret: env.GOOGLE_CLIENT_SECRET as string,
        callbackURL: env.GOOGLE_CALLBACK_URL as string,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value?.toLowerCase().trim();
          if (!email) {
            return done(null, false, { message: 'Google account does not provide an email' });
          }

          let user = await User.findOne({ $or: [{ googleId: profile.id }, { email }] }).select(
            '+passwordHash',
          );

          if (!user) {
            const randomPassword = crypto.randomBytes(32).toString('hex');
            const passwordHash = await bcrypt.hash(randomPassword, 12);

            user = await User.create({
              name: resolveDisplayName(profile, email),
              email,
              passwordHash,
              authProvider: 'google',
              googleId: profile.id,
              emailVerified: true,
              role: 'user',
            });
          } else {
            let shouldSave = false;

            if (!user.googleId) {
              user.googleId = profile.id;
              shouldSave = true;
            }

            if (!user.emailVerified) {
              user.emailVerified = true;
              shouldSave = true;
            }

            if (user.authProvider !== 'google') {
              user.authProvider = 'google';
              shouldSave = true;
            }

            if (shouldSave) {
              await user.save();
            }
          }

          if (!user.isActive) {
            return done(null, false, { message: 'Your account has been disabled' });
          }

          return done(null, {
            id: user._id.toString(),
            role: user.role,
          } satisfies GoogleAuthUser);
        } catch (error) {
          return done(error as Error);
        }
      },
    ),
  );

  strategyInitialized = true;
};
