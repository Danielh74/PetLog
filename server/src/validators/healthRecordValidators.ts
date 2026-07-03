import { z } from 'zod';

const recordTypeEnum = z.enum([
  'vaccination',
  'vet_visit',
  'medication',
  'weight',
  'grooming',
  'other',
]);

export const createHealthRecordSchema = z.object({
  type: recordTypeEnum,
  title: z.string().min(1).max(200),
  date: z.iso.datetime({ offset: true }),
  notes: z.string().max(2000).optional(),
  weight: z.number().positive().optional(),
  nextDueDate: z.iso.datetime({ offset: true }).optional(),
});

export const updateHealthRecordSchema = z.object({
  type: recordTypeEnum.optional(),
  title: z.string().min(1).max(200).optional(),
  date: z.iso.datetime({ offset: true }).optional(),
  notes: z.string().max(2000).optional(),
  weight: z.number().positive().optional(),
  nextDueDate: z.iso.datetime({ offset: true }).optional(),
});
