
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IRole } from './Role.model';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  hourlyRate?: number;
  role: IRole | mongoose.Types.ObjectId; // Reference to Role model
  googleCalendarTokens?: {
    accessToken: string;
    refreshToken: string;
    expiryDate: number;
  };
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  tokenVersion: number;
  passwordChangedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
  createVerificationToken(): string;
  createPasswordResetToken(): string;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: false, // Not required for Google OAuth users
      select: false, // Do not return password by default
    },
    googleId: {
      type: String,
      required: false,
      index: true,
    },
    hourlyRate: {
        type: Number,
        default: 0,
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
    },
    googleCalendarTokens: {
      accessToken: { type: String },
      refreshToken: { type: String },
      expiryDate: { type: Number },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      select: false,
    },
    verificationTokenExpires: {
      type: Date,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    passwordChangedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  // If password is changed, and it's not a new user, update passwordChangedAt
  if (!this.isNew) {
    this.passwordChangedAt = new Date();
    this.tokenVersion = this.tokenVersion + 1; // Increment token version on password change
  }
  next();
});

// Method to compare password
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
    if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

// Method to create email verification token
UserSchema.methods.createVerificationToken = function (): string {
  const crypto = require('crypto');
  const verificationToken = crypto.randomBytes(32).toString('hex');

  this.verificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  this.verificationTokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  return verificationToken;
};

// Method to create password reset token
UserSchema.methods.createPasswordResetToken = function (): string {
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  return resetToken;
};

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
