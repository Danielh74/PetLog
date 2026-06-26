import { z } from 'zod';

export const createReminderSchema = z.object({
  title: z.string().min(1).max(200),
  dueDate: z.string().datetime({ offset: true }),
});

export const updateReminderSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  dueDate: z.string().datetime({ offset: true }).optional(),
  isDone: z.boolean().optional(),
});
