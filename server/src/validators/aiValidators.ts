import { z } from 'zod';

export const symptomCheckSchema = z.object({
  symptoms: z.string().min(10, 'Please describe the symptoms in more detail').max(1000),
});
