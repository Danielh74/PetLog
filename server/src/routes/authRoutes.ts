import { Router } from 'express';
import verifyToken from '../middleware/auth.ts';
import { getMe } from '../controllers/authController.ts';

const router = Router();

router.get('/me', verifyToken, getMe);

export default router;
