'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { ROLE_HOME_ROUTES } from '@/config/routes';

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    const role = user?.roles?.[0] ?? 'student';
    const homeRoute = ROLE_HOME_ROUTES[role] ?? '/student';
    router.replace(homeRoute);
  }, [user, router]);

  return null;
}
