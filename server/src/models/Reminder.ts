import mongoose, { type Document, Schema } from 'mongoose';

export interface IReminder {
  pet: mongoose.Types.ObjectId;
  owner: string; // Firebase UID
  title: string;
  dueDate: Date;
  isDone: boolean;
}

export interface IReminderDocument extends IReminder, Document {}

const reminderSchema = new Schema<IReminderDocument>(
  {
    pet: { type: Schema.Types.ObjectId, ref: 'Pet', required: true, index: true },
    owner: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    isDone: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IReminderDocument>('Reminder', reminderSchema);
