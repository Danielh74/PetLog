import api from './client.ts';
import type { ApiEnvelope, AppUser } from '../types/index.ts';

export const syncMe = async (): Promise<AppUser> => {
  const { data } = await api.get<ApiEnvelope<AppUser>>('/auth/me');
  return data.data;
};
