'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';

export function useRequireAuth(allowedRoles?: Array<'FARMER' | 'BUYER' | 'COOPERATIVE' | 'ADMIN'>) {
  const router = useRouter();
  const { user, isHydrated, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.push('/dashboard');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, user, router]);

  return { user, isReady: isHydrated && !!user };
}
