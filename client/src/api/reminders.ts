import api from './client.ts';
import type { ApiEnvelope, Reminder } from '../types/index.ts';

export interface CreateReminderInput {
  title: string;
  dueDate: string;
}

export const getReminders = async (): Promise<Reminder[]> => {
  const { data } = await api.get<ApiEnvelope<Reminder[]>>('/reminders');
  return data.data;
};

export const createReminder = async (petId: string, input: CreateReminderInput): Promise<Reminder> => {
  const { data } = await api.post<ApiEnvelope<Reminder>>(`/pets/${petId}/reminders`, input);
  return data.data;
};

export const updateReminder = async (
  id: string,
  input: Partial<CreateReminderInput> & { isDone?: boolean },
): Promise<Reminder> => {
  const { data } = await api.patch<ApiEnvelope<Reminder>>(`/reminders/${id}`, input);
  return data.data;
};
