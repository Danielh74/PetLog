import type { Request, Response, NextFunction } from 'express';
import * as reminderService from '../services/reminderService.ts';

export const getReminders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reminders = await reminderService.getRemindersByOwner(req.user.uid);
    res.json({ success: true, data: reminders });
  } catch (error) {
    next(error);
  }
};

export const createReminder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reminder = await reminderService.createReminder(
      req.params['id'] as string,
      req.user.uid,
      req.body,
    );
    res.status(201).json({ success: true, data: reminder });
  } catch (error) {
    next(error);
  }
};

export const updateReminder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reminder = await reminderService.updateReminder(
      req.params['rid'] as string,
      req.user.uid,
      req.body,
    );
    res.json({ success: true, data: reminder });
  } catch (error) {
    next(error);
  }
};

export const deleteReminder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await reminderService.deleteReminder(req.params['rid'] as string, req.user.uid);
    res.json({ success: true, message: 'Reminder deleted' });
  } catch (error) {
    next(error);
  }
};
