import mongoose, { type Document, Schema } from 'mongoose';
import { randomBytes } from 'crypto';

export interface IPet {
  owner: string; // Firebase UID
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  breed?: string;
  weight?: number;
  dob?: Date;
  shareToken: string;
  photoUrl?: string;
}

const options = {
  toJSON: {
    virtuals: true
  },
  timestamps: true
}

export interface IPetDocument extends IPet, Document { }

const petSchema = new Schema<IPetDocument>(
  {
    owner: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    species: {
      type: String,
      enum: ['dog', 'cat', 'bird', 'rabbit', 'other'],
      required: true,
    },
    breed: { type: String, trim: true },
    weight: { type: Number },
    dob: { type: Date },
    shareToken: {
      type: String,
      unique: true,
      default: () => randomBytes(8).toString('hex'),
      index: true,
    },
    photoUrl: { type: String },
  }, options);

petSchema.virtual('healthRecords', {
  ref: 'HealthRecord',
  localField: '_id',
  foreignField: 'pet',
});

export default mongoose.model<IPetDocument>('Pet', petSchema);
