import type { Species } from '../types/index.ts';

export const speciesIcon: Record<Species, string> = {
  dog: 'sound_detection_dog_barking',
  cat: 'pets',
  bird: 'raven',
  rabbit: 'cruelty_free',
  other: 'pets',
};

export const speciesLabel: Record<Species, string> = {
  dog: 'Dog',
  cat: 'Cat',
  bird: 'Bird',
  rabbit: 'Rabbit',
  other: 'Other',
};

export const ageFromDob = (dob?: string): string => {
  if (!dob) return 'Age unknown';
  const years = (Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  if (years < 1) return `${Math.max(1, Math.round(years * 12))} mo`;
  return `${Math.floor(years)} yr`;
};

export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

export const relativeDue = (iso: string): { label: string; overdue: boolean } => {
  const due = new Date(iso).getTime();
  const now = Date.now();
  const days = Math.round((due - now) / (24 * 60 * 60 * 1000));
  if (days < 0) return { label: `${Math.abs(days)} d late`, overdue: true };
  if (days === 0) return { label: 'Today', overdue: false };
  if (days < 14) return { label: `in ${days} d`, overdue: false };
  return { label: `in ${Math.round(days / 7)} wks`, overdue: false };
};
