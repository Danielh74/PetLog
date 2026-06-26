import Pet from '../models/Pet.ts';
import HealthRecord from '../models/HealthRecord.ts';
import Reminder from '../models/Reminder.ts';
import AppError from '../utils/AppError.ts';

export const getPetsByOwner = async (ownerUid: string) => {
  return Pet.find({ owner: ownerUid }).sort({ createdAt: -1 });
};

export const getPetById = async (petId: string, ownerUid: string) => {
  const pet = await Pet.findById(petId);
  if (!pet) throw new AppError('Pet not found', 404);
  if (pet.owner !== ownerUid) throw new AppError('Forbidden', 403);
  return pet;
};

export const getPublicPetByToken = async (shareToken: string) => {
  const pet = await Pet.findOne({ shareToken });
  if (!pet) throw new AppError('Pet not found', 404);
  return pet;
};

export const createPet = async (ownerUid: string, data: {
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  breed?: string;
  dob?: string;
  photoUrl?: string;
}) => {
  return Pet.create({
    owner: ownerUid,
    name: data.name,
    species: data.species,
    ...(data.breed !== undefined && { breed: data.breed }),
    ...(data.dob !== undefined && { dob: new Date(data.dob) }),
    ...(data.photoUrl !== undefined && { photoUrl: data.photoUrl }),
  });
};

export const updatePet = async (petId: string, ownerUid: string, data: {
  name?: string;
  species?: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  breed?: string;
  dob?: string;
  photoUrl?: string;
}) => {
  const pet = await Pet.findById(petId);
  if (!pet) throw new AppError('Pet not found', 404);
  if (pet.owner !== ownerUid) throw new AppError('Forbidden', 403);

  if (data.name !== undefined) pet.name = data.name;
  if (data.species !== undefined) pet.species = data.species;
  if (data.breed !== undefined) pet.breed = data.breed;
  if (data.dob !== undefined) pet.dob = new Date(data.dob);
  if (data.photoUrl !== undefined) pet.photoUrl = data.photoUrl;

  return pet.save();
};

export const deletePet = async (petId: string, ownerUid: string) => {
  const pet = await Pet.findById(petId);
  if (!pet) throw new AppError('Pet not found', 404);
  if (pet.owner !== ownerUid) throw new AppError('Forbidden', 403);

  await Promise.all([
    HealthRecord.deleteMany({ pet: petId }),
    Reminder.deleteMany({ pet: petId }),
    pet.deleteOne(),
  ]);

  return pet;
};
