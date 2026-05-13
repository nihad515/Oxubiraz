'use client';

import { useAuthStore } from '@/store/auth-store';
import { ROLE_HOME_ROUTES } from '@/config/routes';
import { redirect } from 'next/navigation';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const role = user?.roles?.[0]?.name ?? 'student';
  const homeRoute = ROLE_HOME_ROUTES[role] ?? '/student';
  redirect(homeRoute);
}
