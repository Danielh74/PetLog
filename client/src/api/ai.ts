import api from './client.ts';
import type { ApiEnvelope, SymptomCheckResult } from '../types/index.ts';

export const checkSymptoms = async (petId: string, symptoms: string): Promise<SymptomCheckResult> => {
  const { data } = await api.post<ApiEnvelope<SymptomCheckResult>>(`/pets/${petId}/symptom-check`, {
    symptoms,
  });
  return data.data;
};
