import * as petService from '../services/petService.ts';
import handleAsyncError from '../utils/handleAsyncError.ts';

export const getMyPets = handleAsyncError(async (req, res) => {
  const pets = await petService.getPetsByOwner(req.user.uid);
  res.json({ success: true, data: pets });
});

export const getPublicPet = handleAsyncError(async (req, res) => {
  const pet = await petService.getPublicPetByToken(req.params['token'] as string);
  res.json({ success: true, data: pet });
});

export const getPet = handleAsyncError(async (req, res) => {
  const pet = await petService.getPetById(req.params['id'] as string, req.user.uid);
  res.json({ success: true, data: pet });
});

export const createPet = handleAsyncError(async (req, res) => {
  const pet = await petService.createPet(req.user.uid, req.body);
  res.status(201).json({ success: true, data: pet });
});

export const updatePet = handleAsyncError(async (req, res) => {
  const pet = await petService.updatePet(req.params['id'] as string, req.user.uid, req.body);
  res.json({ success: true, data: pet });
});

export const deletePet = handleAsyncError(async (req, res) => {
  await petService.deletePet(req.params['id'] as string, req.user.uid);
  res.json({ success: true, message: 'Pet deleted' });
});
