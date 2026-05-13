import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import type { User, AuthState } from '@/types/auth';

interface AuthActions {
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        }),

      setToken: (token) => set({ token }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      hasPermission: (permission) => {
        const { user } = get();
        if (!user) return false;
        if (user.roles.some((r) => r.name === 'super_admin')) return true;
        return user.permissions.includes(permission);
      },

      hasRole: (role) => {
        const { user } = get();
        if (!user) return false;
        return user.roles.some((r) => r.name === role);
      },

      hasAnyRole: (roles) => {
        const { user } = get();
        if (!user) return false;
        return user.roles.some((r) => roles.includes(r.name));
      },

      hasAnyPermission: (permissions) => {
        const { user } = get();
        if (!user) return false;
        if (user.roles.some((r) => r.name === 'super_admin')) return true;
        return permissions.some((p) => user.permissions.includes(p));
      },
    }),
    {
      name: 'oxubiraz-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
