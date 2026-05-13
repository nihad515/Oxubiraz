export interface Permission {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  group: PermissionGroup;
  guard_name: string;
  created_at: string;
}

export type PermissionGroup =
  | 'users'
  | 'schools'
  | 'texts'
  | 'words'
  | 'strings'
  | 'statistics'
  | 'languages'
  | 'competitions'
  | 'achievements'
  | 'notifications'
  | 'settings'
  | 'roles'
  | 'game'
  | 'reports';

export interface Role {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  guard_name: string;
  permissions: Permission[];
  users_count?: number;
  is_system: boolean;
  created_at: string;
}

export const PERMISSIONS = {
  // Users
  MANAGE_USERS: 'manage_users',
  VIEW_USERS: 'view_users',
  CREATE_USERS: 'create_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',

  // Schools
  MANAGE_SCHOOLS: 'manage_schools',
  VIEW_SCHOOLS: 'view_schools',

  // Content
  MANAGE_TEXTS: 'manage_texts',
  VIEW_TEXTS: 'view_texts',
  MANAGE_WORDS: 'manage_words',
  VIEW_WORDS: 'view_words',

  // Strings
  MANAGE_STRINGS: 'manage_strings',
  VIEW_STRINGS: 'view_strings',

  // Statistics
  MANAGE_STATISTICS: 'manage_statistics',
  VIEW_STATISTICS: 'view_statistics',
  VIEW_OWN_STATISTICS: 'view_own_statistics',

  // Languages
  MANAGE_LANGUAGES: 'manage_languages',

  // Competitions
  MANAGE_COMPETITIONS: 'manage_competitions',
  PARTICIPATE_COMPETITIONS: 'participate_competitions',

  // Achievements
  MANAGE_ACHIEVEMENTS: 'manage_achievements',

  // Notifications
  MANAGE_NOTIFICATIONS: 'manage_notifications',

  // Settings
  MANAGE_SETTINGS: 'manage_settings',

  // Roles
  MANAGE_ROLES: 'manage_roles',
  ASSIGN_ROLES: 'assign_roles',

  // Game
  PLAY_GAME: 'play_game',

  // Reports
  VIEW_REPORTS: 'view_reports',
  EXPORT_REPORTS: 'export_reports',
} as const;

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
