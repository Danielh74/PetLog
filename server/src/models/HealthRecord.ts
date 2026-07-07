import mongoose, { type Document, Schema } from 'mongoose';

export type HealthRecordType =
  | 'vaccination'
  | 'vet_visit'
  | 'medication'
  | 'weight'
  | 'grooming'
  | 'other';

export interface IHealthRecord {
  pet: mongoose.Types.ObjectId;
  owner: string; // Firebase UID — stored for fast auth checks without a join
  type: HealthRecordType;
  title: string;
  date: Date;
  notes?: string;
  weight?: number;
  nextDueDate?: Date;
}

export interface IHealthRecordDocument extends IHealthRecord, Document {}

const healthRecordSchema = new Schema<IHealthRecordDocument>(
  {
    pet: { type: Schema.Types.ObjectId, ref: 'Pet', required: true, index: true },
    owner: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['vaccination', 'vet_visit', 'medication', 'weight', 'grooming', 'other'],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    notes: { type: String, trim: true },
    weight: { type: Number, min: 0 },
    nextDueDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IHealthRecordDocument>('HealthRecord', healthRecordSchema);
