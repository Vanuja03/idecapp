import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { DayStatus } from '../types';

export interface DailyJobControlDocument extends Document {
  date: string;
  status: DayStatus;
  finalizedAt?: Date | null;
  finalizedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const dailyJobControlSchema = new Schema<DailyJobControlDocument>(
  {
    date: { type: String, required: true, unique: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    status: {
      type: String,
      required: true,
      enum: Object.values(DayStatus),
      default: DayStatus.OPEN,
    },
    finalizedAt: { type: Date, default: null },
    finalizedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

export const DailyJobControl: Model<DailyJobControlDocument> =
  mongoose.models.DailyJobControl ||
  mongoose.model<DailyJobControlDocument>('DailyJobControl', dailyJobControlSchema);
