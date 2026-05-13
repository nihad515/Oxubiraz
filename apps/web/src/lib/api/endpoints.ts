export const API = {
  // Auth
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
    resendVerification: '/auth/resend-verification',
    sessions: '/auth/sessions',
    revokeSession: (id: string) => `/auth/sessions/${id}`,
  },

  // Users
  users: {
    list: '/users',
    create: '/users',
    show: (id: number) => `/users/${id}`,
    update: (id: number) => `/users/${id}`,
    delete: (id: number) => `/users/${id}`,
    me: '/users/me',
    updateMe: '/users/me',
    updatePassword: '/users/me/password',
    avatar: '/users/me/avatar',
    sessions: '/users/me/sessions',
    revokeSession: (id: number) => `/users/me/sessions/${id}`,
    profile: '/users/profile',
    bulkDelete: '/users/bulk-delete',
    bulkActivate: '/users/bulk-activate',
    export: '/users/export',
  },

  // Parent
  parent: {
    children: '/parent/children',
    childStats: (id: number) => `/parent/children/${id}`,
  },

  // Roles & Permissions
  roles: {
    list: '/roles',
    create: '/roles',
    show: (id: number) => `/roles/${id}`,
    update: (id: number) => `/roles/${id}`,
    delete: (id: number) => `/roles/${id}`,
    permissions: (id: number) => `/roles/${id}/permissions`,
  },
  permissions: {
    list: '/permissions',
    groups: '/permissions/groups',
  },

  // Schools
  schools: {
    list: '/schools',
    create: '/schools',
    show: (id: number) => `/schools/${id}`,
    update: (id: number) => `/schools/${id}`,
    delete: (id: number) => `/schools/${id}`,
    classes: (id: number) => `/schools/${id}/classes`,
    teachers: (id: number) => `/schools/${id}/teachers`,
    students: (id: number) => `/schools/${id}/students`,
  },

  // Classes
  classes: {
    list: '/classes',
    create: '/classes',
    show: (id: number) => `/classes/${id}`,
    update: (id: number) => `/classes/${id}`,
    delete: (id: number) => `/classes/${id}`,
    students: (id: number) => `/classes/${id}/students`,
  },

  // System Strings
  strings: {
    list: '/strings',
    create: '/strings',
    show: (id: number) => `/strings/${id}`,
    update: (id: number) => `/strings/${id}`,
    delete: (id: number) => `/strings/${id}`,
    byLocale: (locale: string) => `/strings/locale/${locale}`,
    groups: '/strings/groups',
    export: '/strings/export',
    import: '/strings/import',
    bulkUpdate: '/strings/bulk-update',
  },

  // Texts
  texts: {
    list: '/texts',
    create: '/texts',
    show: (id: number) => `/texts/${id}`,
    update: (id: number) => `/texts/${id}`,
    delete: (id: number) => `/texts/${id}`,
    bulkDelete: '/texts/bulk-delete',
    export: '/texts/export',
    import: '/texts/import',
  },

  // Words
  words: {
    lists: '/word-lists',
    createList: '/word-lists',
    showList: (id: number) => `/word-lists/${id}`,
    updateList: (id: number) => `/word-lists/${id}`,
    deleteList: (id: number) => `/word-lists/${id}`,
    items: (listId: number) => `/word-lists/${listId}/words`,
    createItem: (listId: number) => `/word-lists/${listId}/words`,
    deleteItem: (listId: number, wordId: number) => `/word-lists/${listId}/words/${wordId}`,
    import: (listId: number) => `/word-lists/${listId}/import`,
    export: (listId: number) => `/word-lists/${listId}/export`,
  },

  // Game
  game: {
    start: '/game/start',
    finish: '/game/finish',
    results: '/game/results',
    history: '/game/history',
    config: '/game/config',
    randomWords: '/game/random-words',
  },

  // Analytics
  analytics: {
    overview: '/analytics/overview',
    student: (id: number) => `/analytics/student/${id}`,
    myStats: '/analytics/me',
    daily: '/analytics/daily',
    monthly: '/analytics/monthly',
    yearly: '/analytics/yearly',
    byLanguage: '/analytics/by-language',
    byMode: '/analytics/by-mode',
    weakestWords: '/analytics/weakest-words',
    topStudents: '/analytics/top-students',
    schoolStats: (id: number) => `/analytics/school/${id}`,
    classStats: (id: number) => `/analytics/class/${id}`,
    export: '/analytics/export',
  },

  // Gamification
  achievements: {
    list: '/achievements',
    create: '/achievements',
    update: (id: number) => `/achievements/${id}`,
    delete: (id: number) => `/achievements/${id}`,
    myAchievements: '/achievements/me',
  },
  leaderboard: {
    global: '/leaderboard/global',
    school: '/leaderboard/school',
    class: '/leaderboard/class',
    bySchool: (id: number) => `/leaderboard/school/${id}`,
    byClass: (id: number) => `/leaderboard/class/${id}`,
  },

  // Competitions
  competitions: {
    list: '/competitions',
    create: '/competitions',
    show: (id: number) => `/competitions/${id}`,
    update: (id: number) => `/competitions/${id}`,
    delete: (id: number) => `/competitions/${id}`,
    join: (id: number) => `/competitions/${id}/join`,
    results: (id: number) => `/competitions/${id}/results`,
    leaderboard: (id: number) => `/competitions/${id}/leaderboard`,
  },

  // Notifications
  notifications: {
    list: '/notifications',
    markRead: (id: string) => `/notifications/${id}/read`,
    markAllRead: '/notifications/read-all',
    delete: (id: string) => `/notifications/${id}`,
    unreadCount: '/notifications/unread-count',
    broadcast: '/notifications/broadcast',
  },

  // Audit Logs
  auditLogs: {
    list: '/audit-logs',
    export: '/audit-logs/export',
  },

  // Settings
  settings: {
    get: '/settings',
    update: '/settings',
  },
} as const;
