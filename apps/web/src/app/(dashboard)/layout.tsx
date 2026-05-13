import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

import { DashboardShell } from '@/components/layout/dashboard-shell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('oxubiraz_token');

  if (!token) {
    redirect('/login');
  }

  return <DashboardShell>{children}</DashboardShell>;
}
