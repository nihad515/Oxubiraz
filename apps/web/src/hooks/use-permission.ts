'use client';

import { useAuthStore } from '@/store/auth-store';

export function usePermission() {
  const { hasPermission, hasRole, hasAnyRole, hasAnyPermission, user } = useAuthStore();

  return {
    can: hasPermission,
    is: hasRole,
    isAny: hasAnyRole,
    canAny: hasAnyPermission,
    user,
    isAuthenticated: !!user,
    isSuperAdmin: hasRole('super_admin'),
    isAdmin: hasAnyRole(['super_admin', 'admin']),
    isTeacher: hasRole('teacher'),
    isStudent: hasRole('student'),
    isParent: hasRole('parent'),
  };
}
