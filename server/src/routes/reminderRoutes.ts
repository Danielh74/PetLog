import { Router } from 'express';
import verifyToken from '../middleware/auth.ts';
import validate from '../middleware/validate.ts';
import { updateReminderSchema } from '../validators/reminderValidators.ts';
import * as reminderController from '../controllers/reminderController.ts';

const router = Router();

router.use(verifyToken);

router.get('/', reminderController.getReminders);
router.patch('/:rid', validate(updateReminderSchema), reminderController.updateReminder);
router.delete('/:rid', reminderController.deleteReminder);

export default router;
