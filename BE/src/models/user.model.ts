import { Schema, model, type Document } from 'mongoose';
import { ROLES, type UserRole } from '../constants/roles';

export type AuthProvider = 'local' | 'google';

export interface IUser extends Document {
  name: string;
  username: string;
  email: string;
  phone?: string;
  passwordHash: string;
  avatarUrl?: string;
  avatarPublicId?: string;
  authProvider: AuthProvider;
  googleId?: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  passwordResetTokenHash?: string;
  passwordResetExpiresAt?: Date;
  emailVerificationTokenHash?: string;
  emailVerificationExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      trim: true,
      unique: true,
      index: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
      match: [/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/, 'Please enter a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false,
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    avatarPublicId: {
      type: String,
      trim: true,
      select: false,
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    passwordResetTokenHash: {
      type: String,
      select: false,
    },
    passwordResetExpiresAt: {
      type: Date,
      select: false,
    },
    emailVerificationTokenHash: {
      type: String,
      select: false,
    },
    emailVerificationExpiresAt: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    collection: 'users',
  },
);

const User = model<IUser>('User', userSchema);

export default User;