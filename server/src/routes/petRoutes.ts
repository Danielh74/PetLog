import { Router } from 'express';
import verifyToken from '../middleware/auth.ts';
import validate from '../middleware/validate.ts';
import { createPetSchema, updatePetSchema } from '../validators/petValidators.ts';
import { createReminderSchema } from '../validators/reminderValidators.ts';
import * as petController from '../controllers/petController.ts';
import { createReminder } from '../controllers/reminderController.ts';
import healthRecordRouter from './healthRecordRoutes.ts';

const router = Router();

// Public — must come before verifyToken middleware
router.get('/share/:token', petController.getPublicPet);

// All routes below require auth
router.use(verifyToken);

router.get('/', petController.getMyPets);
router.post('/', validate(createPetSchema), petController.createPet);
router.get('/:id', petController.getPet);
router.patch('/:id', validate(updatePetSchema), petController.updatePet);
router.delete('/:id', petController.deletePet);

// Nested: POST /api/pets/:id/reminders
router.post('/:id/reminders', validate(createReminderSchema), createReminder);

// Nested health records router
router.use('/:id/records', healthRecordRouter);

export default router;
