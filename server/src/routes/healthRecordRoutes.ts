import { Router } from 'express';
import validate from '../middleware/validate.ts';
import { createHealthRecordSchema, updateHealthRecordSchema } from '../validators/healthRecordValidators.ts';
import * as healthRecordController from '../controllers/healthRecordController.ts';

// mergeParams: true lets us access :id from the parent petRoutes
const router = Router({ mergeParams: true });

router.get('/', healthRecordController.getRecords);
router.post('/', validate(createHealthRecordSchema), healthRecordController.createRecord);
router.patch('/:rid', validate(updateHealthRecordSchema), healthRecordController.updateRecord);
router.delete('/:rid', healthRecordController.deleteRecord);

export default router;
