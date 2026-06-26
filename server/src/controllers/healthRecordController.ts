import type { Request, Response, NextFunction } from 'express';
import * as healthRecordService from '../services/healthRecordService.ts';

export const getRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Number(req.query['page']) || 1;
    const limit = Number(req.query['limit']) || 10;
    const result = await healthRecordService.getRecordsByPet(
      req.params['id'] as string,
      req.user.uid,
      page,
      limit,
    );
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const createRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const record = await healthRecordService.createRecord(
      req.params['id'] as string,
      req.user.uid,
      req.body,
    );
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

export const updateRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const record = await healthRecordService.updateRecord(
      req.params['id'] as string,
      req.params['rid'] as string,
      req.user.uid,
      req.body,
    );
    res.json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};

export const deleteRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await healthRecordService.deleteRecord(
      req.params['id'] as string,
      req.params['rid'] as string,
      req.user.uid,
    );
    res.json({ success: true, message: 'Record deleted' });
  } catch (error) {
    next(error);
  }
};
