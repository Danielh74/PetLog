export type Species = 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';

export interface Pet {
  _id: string;
  owner: string;
  name: string;
  species: Species;
  breed?: string;
  dob?: string;
  shareToken: string;
  photoUrl?: string;
  healthRecords?: HealthRecord[];
  createdAt: string;
  updatedAt: string;
}

export type HealthRecordType =
  | 'vaccination'
  | 'vet_visit'
  | 'medication'
  | 'weight'
  | 'grooming'
  | 'other';

export interface HealthRecord {
  _id: string;
  pet: string;
  owner: string;
  type: HealthRecordType;
  title: string;
  date: string;
  notes?: string;
  weight?: number;
  nextDueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  _id: string;
  pet: string | { _id: string; name: string; species: Species };
  owner: string;
  title: string;
  dueDate: string;
  isDone: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AppUser {
  _id: string;
  firebaseUid: string;
  name: string;
  email: string;
}

export type Urgency = 'can_wait' | 'within_48h' | 'go_now';

export interface SymptomCheckResult {
  causes: { name: string; likelihood: 'high' | 'medium' | 'low'; homeCare: string }[];
  urgency: Urgency;
  disclaimer: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}
