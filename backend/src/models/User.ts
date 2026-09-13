import mongoose, { Document, Model, Schema } from 'mongoose';
import { UserRole } from '../types';

export interface UserDocument extends Document {
  username: string;
  passwordHash: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      required: true,
      enum: Object.values(UserRole),
    },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const User: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>('User', userSchema);
