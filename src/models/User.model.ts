
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
  refreshTokens?: string[];
  googleCalendarTokens?: {
    accessToken: string;
    refreshToken: string;
    expiryDate: number;
  };
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
  createVerificationToken(): string;
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
    refreshTokens: [String],
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
      select: false, // Do not return this field
    },
    verificationTokenExpires: {
      type: Date,
      select: false, // Do not return this field
    },
  },
  { timestamps: true }
);

// Pre-save hook to hash password
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
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

  // Set token to expire in 10 minutes
  this.verificationTokenExpires = Date.now() + 10 * 60 * 1000;

  return verificationToken;
};

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
