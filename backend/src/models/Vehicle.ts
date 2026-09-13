import mongoose, { Document, Model, Schema } from 'mongoose';

export interface VehicleDocument extends Document {
  vehicleNumber: string;
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const vehicleSchema = new Schema<VehicleDocument>(
  {
    vehicleNumber: { type: String, required: true, unique: true, trim: true, uppercase: true },
    description: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Vehicle: Model<VehicleDocument> =
  mongoose.models.Vehicle || mongoose.model<VehicleDocument>('Vehicle', vehicleSchema);
