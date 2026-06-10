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
  aiTurns: number;
  aiTurnsUsed: number;
  aiTurnsResetAt: Date;
  subscriptionPlan: 'starter' | 'standard' | 'premium' | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Họ và tên là bắt buộc'],
      trim: true,
      minlength: [2, 'Họ và tên phải có ít nhất 2 ký tự'],
      maxlength: [50, 'Họ và tên không được vượt quá 50 ký tự'],
    },
    username: {
      type: String,
      required: [true, 'Tên đăng nhập là bắt buộc'],
      trim: true,
      unique: true,
      index: true,
      minlength: [3, 'Tên đăng nhập phải có ít nhất 3 ký tự'],
      maxlength: [30, 'Tên đăng nhập không được vượt quá 30 ký tự'],
    },
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
      match: [/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/, 'Vui lòng nhập địa chỉ email hợp lệ'],
    },
    phone: {
      type: String,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Mã băm mật khẩu là bắt buộc'],
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
    subscriptionPlan: {
      type: String,
      enum: ['starter', 'standard', 'premium', null],
      default: null,
    },
    aiTurnsUsed: {
      type: Number,
      default: 0,
    },
    aiTurnsResetAt: {
      type: Date,
      default: () => new Date(),
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
    aiTurns: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    collection: 'users',
  },
);

const User = model<IUser>('User', userSchema);

export default User;