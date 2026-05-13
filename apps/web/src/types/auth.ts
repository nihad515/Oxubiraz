import type { Role } from './permissions';

export type UserRole = 'super_admin' | 'admin' | 'teacher' | 'student' | 'parent';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  locale: 'az' | 'ru' | 'en';
  role: UserRole;
  roles: Role[];
  permissions: string[];
  school_id?: number;
  class_id?: number;
  teacher_id?: number;
  parent_id?: number;
  is_active: boolean;
  email_verified_at?: string;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
  // Gamification
  xp: number;
  level: number;
  streak_days: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  login: string; // username or email
  password: string;
  remember?: boolean;
  device_name?: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  username: string;
  email?: string;
  password: string;
  password_confirmation: string;
  role: UserRole;
  school_id?: number;
  class_id?: number;
  teacher_id?: number;
  parent_username?: string;
  phone?: string;
  locale: 'az' | 'ru' | 'en';
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthTokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_at: string;
  user: User;
}

export interface DeviceSession {
  id: string;
  device_name: string;
  ip_address: string;
  user_agent: string;
  last_active_at: string;
  is_current: boolean;
}
