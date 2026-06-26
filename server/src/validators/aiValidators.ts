import { z } from 'zod';

export const symptomCheckSchema = z.object({
  petId: z.string().min(1),
  symptoms: z.string().min(10, 'Please describe the symptoms in more detail').max(1000),
});
