import mongoose, { type Document, Schema } from 'mongoose';

export interface IUser {
  firebaseUid: string;
  name: string;
  email: string;
}

export interface IUserDocument extends IUser, Document {}

const userSchema = new Schema<IUserDocument>(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model<IUserDocument>('User', userSchema);
