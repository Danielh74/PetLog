import { z } from 'zod';

export const createPetSchema = z.object({
  name: z.string().min(1).max(100),
  species: z.enum(['dog', 'cat', 'bird', 'rabbit', 'other']),
  breed: z.string().max(100).optional(),
  weight: z.number().positive().optional(),
  dob: z.iso.date().optional(),
  photoUrl: z.url().optional(),
});

export const updatePetSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  species: z.enum(['dog', 'cat', 'bird', 'rabbit', 'other']).optional(),
  breed: z.string().max(100).optional(),
  weight: z.number().positive().optional(),
  dob: z.iso.date().optional(),
  photoUrl: z.url().optional(),
});
