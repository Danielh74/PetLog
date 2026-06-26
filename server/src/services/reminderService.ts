import Reminder from '../models/Reminder.ts';
import Pet from '../models/Pet.ts';
import AppError from '../utils/AppError.ts';

export const getRemindersByOwner = async (ownerUid: string) => {
  return Reminder.find({ owner: ownerUid })
    .populate('pet', 'name species')
    .sort({ dueDate: 1 });
};

export const createReminder = async (petId: string, ownerUid: string, data: {
  title: string;
  dueDate: string;
}) => {
  const pet = await Pet.findById(petId);
  if (!pet) throw new AppError('Pet not found', 404);
  if (pet.owner !== ownerUid) throw new AppError('Forbidden', 403);

  return Reminder.create({
    pet: petId,
    owner: ownerUid,
    title: data.title,
    dueDate: new Date(data.dueDate),
  });
};

export const updateReminder = async (reminderId: string, ownerUid: string, data: {
  title?: string;
  dueDate?: string;
  isDone?: boolean;
}) => {
  const reminder = await Reminder.findById(reminderId);
  if (!reminder) throw new AppError('Reminder not found', 404);
  if (reminder.owner !== ownerUid) throw new AppError('Forbidden', 403);

  Object.assign(reminder, {
    ...(data.title !== undefined && { title: data.title }),
    ...(data.dueDate !== undefined && { dueDate: new Date(data.dueDate) }),
    ...(data.isDone !== undefined && { isDone: data.isDone }),
  });

  return reminder.save();
};

export const deleteReminder = async (reminderId: string, ownerUid: string) => {
  const reminder = await Reminder.findById(reminderId);
  if (!reminder) throw new AppError('Reminder not found', 404);
  if (reminder.owner !== ownerUid) throw new AppError('Forbidden', 403);
  await reminder.deleteOne();
  return reminder;
};
