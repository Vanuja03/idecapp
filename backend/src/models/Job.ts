import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { JobStatus, JobType, VehicleSource } from '../types';

export interface JobDocument extends Document {
  jobDate: string;
  jobType: JobType;
  vehicleSource: VehicleSource;
  vehicleId: Types.ObjectId | null;
  vehicleNumberSnapshot: string;
  destination: string;
  status: JobStatus;
  notes?: string;
  createdBy: Types.ObjectId;
  updatedBy: Types.ObjectId;
  finalizedAt?: Date | null;
  finalizedBy?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<JobDocument>(
  {
    jobDate: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
    jobType: {
      type: String,
      required: true,
      enum: Object.values(JobType),
      default: JobType.IM,
    },
    vehicleSource: {
      type: String,
      required: true,
      enum: Object.values(VehicleSource),
      default: VehicleSource.OWN,
    },
    // Only set for company lorries; temporary (OTHER) lorries keep their number in vehicleNumberSnapshot
    vehicleId: { type: Schema.Types.ObjectId, ref: 'Vehicle', default: null },
    vehicleNumberSnapshot: { type: String, required: true, trim: true, maxlength: 32 },
    destination: { type: String, required: true, trim: true, maxlength: 200 },
    status: {
      type: String,
      required: true,
      enum: Object.values(JobStatus),
      default: JobStatus.PENDING,
    },
    notes: { type: String, trim: true, maxlength: 1000, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    finalizedAt: { type: Date, default: null },
    finalizedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

jobSchema.index({ jobDate: 1 });
jobSchema.index({ vehicleId: 1, jobDate: 1 });

export const Job: Model<JobDocument> =
  mongoose.models.Job || mongoose.model<JobDocument>('Job', jobSchema);
