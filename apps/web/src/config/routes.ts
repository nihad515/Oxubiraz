export const ROUTES = {
  // Public
  home: '/',
  login: '/login',
  register: '/register',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  verifyEmail: '/verify-email',

  // Dashboard (role-based redirect)
  dashboard: '/dashboard',

  // Admin
  admin: {
    root: '/admin',
    users: '/admin/users',
    schools: '/admin/schools',
    roles: '/admin/roles',
    permissions: '/admin/permissions',
    strings: '/admin/strings',
    languages: '/admin/languages',
    texts: '/admin/texts',
    words: '/admin/words',
    analytics: '/admin/analytics',
    reports: '/admin/reports',
    settings: '/admin/settings',
    competitions: '/admin/competitions',
    achievements: '/admin/achievements',
    notifications: '/admin/notifications',
    auditLogs: '/admin/audit-logs',
  },

  // Teacher
  teacher: {
    root: '/teacher',
    students: '/teacher/students',
    classes: '/teacher/classes',
    competitions: '/teacher/competitions',
    analytics: '/teacher/analytics',
    notifications: '/teacher/notifications',
  },

  // Student
  student: {
    root: '/student',
    game: '/student/game',
    play: '/student/game', // backward-compat alias
    achievements: '/student/achievements',
    leaderboard: '/student/leaderboard',
    history: '/student/history',
    progress: '/student/progress',
    notifications: '/student/notifications',
    profile: '/student/profile',
  },

  // Parent
  parent: {
    root: '/parent',
    children: '/parent/children',
    progress: '/parent/progress',
    notifications: '/parent/notifications',
  },

  // Shared
  profile: '/profile',
  settings: '/settings',
} as const;

export const PUBLIC_ROUTES = [
  ROUTES.home,
  ROUTES.login,
  ROUTES.register,
  ROUTES.forgotPassword,
  ROUTES.resetPassword,
  ROUTES.verifyEmail,
];

export const ROLE_HOME_ROUTES: Record<string, string> = {
  super_admin: ROUTES.admin.root,
  admin: ROUTES.admin.root,
  teacher: ROUTES.teacher.root,
  student: ROUTES.student.root,
  parent: ROUTES.parent.root,
};
