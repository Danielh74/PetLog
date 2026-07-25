import * as reminderService from '../services/reminderService.ts';
import handleAsyncError from '../utils/handleAsyncError.ts';

export const getReminders = handleAsyncError(async (req, res) => {
  const reminders = await reminderService.getRemindersByOwner(req.user.uid);
  res.json({ success: true, message: 'Reminders fetched successfully', data: reminders });
});

export const createReminder = handleAsyncError(async (req, res) => {
  const reminder = await reminderService.createReminder(
    req.params['id'] as string,
    req.user.uid,
    req.body,
  );
  res.status(201).json({ success: true, message: 'Reminder created successfully', data: reminder });
});

export const updateReminder = handleAsyncError(async (req, res) => {
  const reminder = await reminderService.updateReminder(
    req.params['rid'] as string,
    req.user.uid,
    req.body,
  );
  res.json({ success: true, message: 'Reminder updated successfully', data: reminder });
});

export const deleteReminder = handleAsyncError(async (req, res) => {
  await reminderService.deleteReminder(req.params['rid'] as string, req.user.uid);
  res.json({ success: true, message: 'Reminder deleted successfully' });
});
