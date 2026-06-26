import type { Request, Response, NextFunction } from 'express';
import * as aiService from '../services/aiService.ts';

export const symptomCheck = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { petId, symptoms } = req.body as { petId: string; symptoms: string };
    const result = await aiService.checkSymptoms(petId, req.user.uid, symptoms);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
