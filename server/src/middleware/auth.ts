import type { Request, Response, NextFunction } from 'express';
import { getAuth } from 'firebase-admin/auth';
import '../config/firebase.ts';

const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
    return;
  }
  try {
    const token = authHeader.split(' ')[1];
    req.user = await getAuth().verifyIdToken(token!);
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Unauthorized: Invalid token' });
  }
};

export default verifyToken;
