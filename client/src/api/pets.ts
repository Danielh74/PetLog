import api from './client.ts';
import type { ApiEnvelope, Pet, Species } from '../types/index.ts';

export interface CreatePetInput {
  name: string;
  species: Species;
  breed?: string;
  dob?: string;
  photoUrl?: string;
}

export const getMyPets = async (): Promise<Pet[]> => {
  const { data } = await api.get<ApiEnvelope<Pet[]>>('/pets');
  return data.data;
};

export const getPet = async (id: string): Promise<Pet> => {
  const { data } = await api.get<ApiEnvelope<Pet>>(`/pets/${id}`);
  return data.data;
};

export const getPublicPet = async (token: string): Promise<Pet> => {
  const { data } = await api.get<ApiEnvelope<Pet>>(`/pets/share/${token}`);
  return data.data;
};

export const createPet = async (input: CreatePetInput): Promise<Pet> => {
  const { data } = await api.post<ApiEnvelope<Pet>>('/pets', input);
  return data.data;
};

export const deletePet = async (id: string): Promise<void> => {
  await api.delete(`/pets/${id}`);
};
