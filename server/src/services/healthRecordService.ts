import HealthRecord, { type HealthRecordType } from '../models/HealthRecord.ts';
import Pet from '../models/Pet.ts';
import AppError from '../utils/AppError.ts';

const assertPetOwnership = async (petId: string, ownerUid: string) => {
  const pet = await Pet.findById(petId);
  if (!pet) throw new AppError('Pet not found', 404);
  if (pet.owner !== ownerUid) throw new AppError('Forbidden', 403);
  return pet;
};

export const getRecordsByPet = async (petId: string, ownerUid: string, page = 1, limit = 10) => {
  await assertPetOwnership(petId, ownerUid);
  const skip = (page - 1) * limit;
  const [records, total] = await Promise.all([
    HealthRecord.find({ pet: petId }).sort({ date: -1 }).skip(skip).limit(limit),
    HealthRecord.countDocuments({ pet: petId }),
  ]);
  return { records, total, page, pages: Math.ceil(total / limit) };
};

export const createRecord = async (petId: string, ownerUid: string, data: {
  type: HealthRecordType;
  title: string;
  date: string;
  notes?: string;
  weight?: number;
  nextDueDate?: string;
}) => {
  await assertPetOwnership(petId, ownerUid);
  return HealthRecord.create({
    pet: petId,
    owner: ownerUid,
    type: data.type,
    title: data.title,
    date: new Date(data.date),
    ...(data.notes !== undefined && { notes: data.notes }),
    ...(data.weight !== undefined && { weight: data.weight }),
    ...(data.nextDueDate !== undefined && { nextDueDate: new Date(data.nextDueDate) }),
  });
};

export const updateRecord = async (petId: string, recordId: string, ownerUid: string, data: {
  type?: HealthRecordType;
  title?: string;
  date?: string;
  notes?: string;
  weight?: number;
  nextDueDate?: string;
}) => {
  const record = await HealthRecord.findOne({ _id: recordId, pet: petId });
  if (!record) throw new AppError('Health record not found', 404);
  if (record.owner !== ownerUid) throw new AppError('Forbidden', 403);

  if (data.type !== undefined) record.type = data.type;
  if (data.title !== undefined) record.title = data.title;
  if (data.date !== undefined) record.date = new Date(data.date);
  if (data.notes !== undefined) record.notes = data.notes;
  if (data.weight !== undefined) record.weight = data.weight;
  if (data.nextDueDate !== undefined) record.nextDueDate = new Date(data.nextDueDate);

  return record.save();
};

export const deleteRecord = async (petId: string, recordId: string, ownerUid: string) => {
  const record = await HealthRecord.findOne({ _id: recordId, pet: petId });
  if (!record) throw new AppError('Health record not found', 404);
  if (record.owner !== ownerUid) throw new AppError('Forbidden', 403);
  await record.deleteOne();
  return record;
};
