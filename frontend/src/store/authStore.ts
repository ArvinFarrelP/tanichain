'use client';

import { create } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: 'FARMER' | 'BUYER' | 'COOPERATIVE' | 'ADMIN';
  wallet?: {
    publicKey: string;
    isFunded: boolean;
  } | null;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isHydrated: boolean;
  setSession: (user: AuthUser, token: string) => void;
  clearSession: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isHydrated: false,

  setSession: (user, token) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('tanichain_token', token);
      window.localStorage.setItem('tanichain_user', JSON.stringify(user));
    }
    set({ user, token });
  },

  clearSession: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('tanichain_token');
      window.localStorage.removeItem('tanichain_user');
    }
    set({ user: null, token: null });
  },

  hydrate: () => {
    if (typeof window === 'undefined') return;
    const token = window.localStorage.getItem('tanichain_token');
    const userRaw = window.localStorage.getItem('tanichain_user');
    if (token && userRaw) {
      try {
        set({ user: JSON.parse(userRaw), token, isHydrated: true });
        return;
      } catch {
        // fall through to clear invalid state
      }
    }
    set({ isHydrated: true });
  },
}));
