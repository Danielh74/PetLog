import { z } from 'zod';

export const createPetSchema = z.object({
  name: z.string().min(1).max(100),
  species: z.enum(['dog', 'cat', 'bird', 'rabbit', 'other']),
  breed: z.string().max(100).optional(),
  dob: z.string().datetime({ offset: true }).optional(),
  photoUrl: z.string().url().optional(),
});

export const updatePetSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  species: z.enum(['dog', 'cat', 'bird', 'rabbit', 'other']).optional(),
  breed: z.string().max(100).optional(),
  dob: z.string().datetime({ offset: true }).optional(),
  photoUrl: z.string().url().optional(),
});
