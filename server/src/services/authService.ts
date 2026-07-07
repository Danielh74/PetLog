import User from '../models/User.ts';
import type { DecodedIdToken } from 'firebase-admin/auth';

export const syncUser = async (decodedToken: DecodedIdToken) => {
  const { uid, email, name } = decodedToken;
  const existing = await User.findOne({ firebaseUid: uid });
  if (existing) return existing;

  return User.create({
    firebaseUid: uid,
    email: email ?? '',
    name: name ?? email?.split('@')[0] ?? 'User',
  });
};
