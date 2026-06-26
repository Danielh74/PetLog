import mongoose, { type Document, Schema } from 'mongoose';
import { randomBytes } from 'crypto';

export interface IPet {
  owner: string; // Firebase UID
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  breed?: string;
  dob?: Date;
  shareToken: string;
  photoUrl?: string;
}

export interface IPetDocument extends IPet, Document {}

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
    dob: { type: Date },
    shareToken: {
      type: String,
      unique: true,
      default: () => randomBytes(8).toString('hex'),
      index: true,
    },
    photoUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IPetDocument>('Pet', petSchema);
