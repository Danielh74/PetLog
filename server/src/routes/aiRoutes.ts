import { Router } from 'express';
import verifyToken from '../middleware/auth.ts';
import validate from '../middleware/validate.ts';
import { symptomCheckSchema } from '../validators/aiValidators.ts';
import { symptomCheck } from '../controllers/aiController.ts';

const router = Router();

router.use(verifyToken);

router.post('/symptom-check', validate(symptomCheckSchema), symptomCheck);

export default router;
