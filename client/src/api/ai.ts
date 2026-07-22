import api from './client.ts';
import type { ApiEnvelope, SymptomCheckResult } from '../types/index.ts';

export const checkSymptoms = async (petId: string, symptoms: string): Promise<SymptomCheckResult> => {
  const { data } = await api.post<ApiEnvelope<SymptomCheckResult>>('/ai/symptom-check', {
    petId,
    symptoms,
  });
  return data.data;
};
