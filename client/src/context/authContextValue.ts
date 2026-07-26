import { createContext } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import type { AppUser } from '../types/index.ts';

export interface AuthState {
  firebaseUser: FirebaseUser | null;
  appUser: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * The context object and its type live here, apart from the provider.
 * Fast Refresh only patches a module in place when every export is a
 * component; a context or a hook shipped alongside the provider forced a
 * full page reload on each edit.
 */
export const AuthContext = createContext<AuthState | null>(null);
