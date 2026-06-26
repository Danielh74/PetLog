import type { Request, Response, NextFunction } from 'express';
import * as petService from '../services/petService.ts';

export const getMyPets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pets = await petService.getPetsByOwner(req.user.uid);
    res.json({ success: true, data: pets });
  } catch (error) {
    next(error);
  }
};

export const getPublicPet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pet = await petService.getPublicPetByToken(req.params['token'] as string);
    res.json({ success: true, data: pet });
  } catch (error) {
    next(error);
  }
};

export const getPet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pet = await petService.getPetById(req.params['id'] as string, req.user.uid);
    res.json({ success: true, data: pet });
  } catch (error) {
    next(error);
  }
};

export const createPet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pet = await petService.createPet(req.user.uid, req.body);
    res.status(201).json({ success: true, data: pet });
  } catch (error) {
    next(error);
  }
};

export const updatePet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pet = await petService.updatePet(req.params['id'] as string, req.user.uid, req.body);
    res.json({ success: true, data: pet });
  } catch (error) {
    next(error);
  }
};

export const deletePet = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await petService.deletePet(req.params['id'] as string, req.user.uid);
    res.json({ success: true, message: 'Pet deleted' });
  } catch (error) {
    next(error);
  }
};
