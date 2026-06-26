import type { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService.ts';

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await authService.syncUser(req.user);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};
