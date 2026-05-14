// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './auth-store';
import type { User } from '@/types/auth';

// Minimal Role shape required by the User type
const makeRole = (name: string) => ({
  id: 1,
  name,
  display_name: name,
  guard_name: 'web',
  permissions: [],
  is_system: true,
  created_at: '2025-01-01T00:00:00Z',
});

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 1,
  first_name: 'Test',
  last_name: 'User',
  username: 'testuser',
  email: 'test@oxubiraz.az',
  locale: 'az',
  role: 'student',
  roles: [makeRole('student')],
  permissions: ['play_game', 'view_own_statistics'],
  is_active: true,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  xp: 150,
  level: 2,
  streak_days: 5,
  ...overrides,
});

function resetStore() {
  useAuthStore.setState({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });
}

describe('auth store – initial state', () => {
  beforeEach(resetStore);

  it('starts unauthenticated', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('starts with isLoading true', () => {
    expect(useAuthStore.getState().isLoading).toBe(true);
  });
});

describe('auth store – setUser', () => {
  beforeEach(resetStore);

  it('sets user and marks authenticated', () => {
    const user = makeUser();
    useAuthStore.getState().setUser(user);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(user);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('replaces existing user', () => {
    const first = makeUser({ id: 1, first_name: 'First' });
    const second = makeUser({ id: 2, first_name: 'Second' });

    useAuthStore.getState().setUser(first);
    useAuthStore.getState().setUser(second);

    expect(useAuthStore.getState().user?.first_name).toBe('Second');
  });
});

describe('auth store – setToken', () => {
  beforeEach(resetStore);

  it('stores the token', () => {
    useAuthStore.getState().setToken('my-secret-token');
    expect(useAuthStore.getState().token).toBe('my-secret-token');
  });

  it('does not affect authentication status', () => {
    useAuthStore.getState().setToken('tok');
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});

describe('auth store – setLoading', () => {
  beforeEach(resetStore);

  it('updates the loading flag', () => {
    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});

describe('auth store – logout', () => {
  beforeEach(() => {
    resetStore();
    useAuthStore.getState().setUser(makeUser());
    useAuthStore.getState().setToken('tok-123');
  });

  it('clears user and token', () => {
    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('marks unauthenticated', () => {
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });

  it('sets isLoading to false after logout', () => {
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().isLoading).toBe(false);
  });
});

describe('auth store – hasPermission', () => {
  beforeEach(resetStore);

  it('returns false when no user is set', () => {
    expect(useAuthStore.getState().hasPermission('play_game')).toBe(false);
  });

  it('returns true for a permission the user has', () => {
    useAuthStore.getState().setUser(makeUser());
    expect(useAuthStore.getState().hasPermission('play_game')).toBe(true);
  });

  it('returns false for a permission the user lacks', () => {
    useAuthStore.getState().setUser(makeUser());
    expect(useAuthStore.getState().hasPermission('manage_users')).toBe(false);
  });

  it('super_admin bypasses permission check and always returns true', () => {
    const admin = makeUser({
      role: 'super_admin',
      roles: [makeRole('super_admin')],
      permissions: [],
    });
    useAuthStore.getState().setUser(admin);
    expect(useAuthStore.getState().hasPermission('manage_users')).toBe(true);
    expect(useAuthStore.getState().hasPermission('any_made_up_permission')).toBe(true);
  });
});

describe('auth store – hasRole', () => {
  beforeEach(resetStore);

  it('returns false when no user is set', () => {
    expect(useAuthStore.getState().hasRole('student')).toBe(false);
  });

  it('returns true when user has the role', () => {
    useAuthStore.getState().setUser(makeUser({ roles: [makeRole('student')] }));
    expect(useAuthStore.getState().hasRole('student')).toBe(true);
  });

  it('returns false when user does not have the role', () => {
    useAuthStore.getState().setUser(makeUser({ roles: [makeRole('student')] }));
    expect(useAuthStore.getState().hasRole('admin')).toBe(false);
  });
});

describe('auth store – hasAnyRole', () => {
  beforeEach(resetStore);

  it('returns false when no user is set', () => {
    expect(useAuthStore.getState().hasAnyRole(['admin', 'teacher'])).toBe(false);
  });

  it('returns true when user has at least one of the given roles', () => {
    useAuthStore.getState().setUser(makeUser({ roles: [makeRole('teacher')] }));
    expect(useAuthStore.getState().hasAnyRole(['admin', 'teacher'])).toBe(true);
  });

  it('returns false when user has none of the given roles', () => {
    useAuthStore.getState().setUser(makeUser({ roles: [makeRole('student')] }));
    expect(useAuthStore.getState().hasAnyRole(['admin', 'teacher'])).toBe(false);
  });
});

describe('auth store – hasAnyPermission', () => {
  beforeEach(resetStore);

  it('returns false when no user is set', () => {
    expect(useAuthStore.getState().hasAnyPermission(['play_game'])).toBe(false);
  });

  it('returns true when user has at least one matching permission', () => {
    useAuthStore.getState().setUser(makeUser({ permissions: ['play_game'] }));
    expect(useAuthStore.getState().hasAnyPermission(['manage_users', 'play_game'])).toBe(true);
  });

  it('returns false when user has none of the requested permissions', () => {
    useAuthStore.getState().setUser(makeUser({ permissions: ['play_game'] }));
    expect(useAuthStore.getState().hasAnyPermission(['manage_users', 'manage_texts'])).toBe(false);
  });

  it('super_admin returns true regardless of permissions array', () => {
    const admin = makeUser({
      roles: [makeRole('super_admin')],
      permissions: [],
    });
    useAuthStore.getState().setUser(admin);
    expect(useAuthStore.getState().hasAnyPermission(['manage_users', 'delete_everything'])).toBe(true);
  });
});
