'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import { Sidebar } from './sidebar';
import { TopBar } from './top-bar';
import { BottomNav } from './bottom-nav';
import { useAuthStore } from '@/store/auth-store';
import { useUiStore } from '@/store/ui-store';
import { useRealtimeNotifications } from '@/hooks/use-realtime';
import { PushPermissionPrompt } from '@/components/notifications/push-permission-prompt';
import { cn } from '@/lib/utils/cn';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { sidebarOpen, sidebarCollapsed } = useUiStore();
  const router = useRouter();

  useRealtimeNotifications();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Main content */}
      <div
        className={cn(
          'flex flex-1 flex-col overflow-hidden transition-all duration-300',
        )}
      >
        <TopBar />

        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="container mx-auto max-w-7xl p-4 sm:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden">
        <BottomNav />
      </div>

      <PushPermissionPrompt />
    </div>
  );
}
