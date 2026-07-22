import api from './client.ts';
import type { ApiEnvelope, HealthRecord, HealthRecordType } from '../types/index.ts';

export interface CreateRecordInput {
  type: HealthRecordType;
  title: string;
  date: string;
  notes?: string;
  weight?: number;
  nextDueDate?: string;
}

interface RecordsPage {
  records: HealthRecord[];
  total: number;
  page: number;
  pages: number;
}

export const getRecords = async (petId: string, page = 1, limit = 10): Promise<RecordsPage> => {
  const { data } = await api.get<ApiEnvelope<never> & RecordsPage>(
    `/pets/${petId}/records`,
    { params: { page, limit } },
  );
  return { records: data.records, total: data.total, page: data.page, pages: data.pages };
};

export const createRecord = async (petId: string, input: CreateRecordInput): Promise<HealthRecord> => {
  const { data } = await api.post<ApiEnvelope<HealthRecord>>(`/pets/${petId}/records`, input);
  return data.data;
};
