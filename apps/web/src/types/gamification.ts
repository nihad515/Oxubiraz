export interface Achievement {
  id: number;
  key: string;
  name: string;
  description: string;
  icon: string;
  badge_color: string;
  xp_reward: number;
  condition_type: AchievementConditionType;
  condition_value: number;
  is_secret: boolean;
  earned_at?: string;
}

export type AchievementConditionType =
  | 'wpm_reached'
  | 'sessions_completed'
  | 'streak_days'
  | 'words_read'
  | 'perfect_session'
  | 'language_mastery'
  | 'first_session'
  | 'level_reached';

export interface Badge {
  id: number;
  key: string;
  name: string;
  icon: string;
  color: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface XpEvent {
  id: number;
  user_id: number;
  amount: number;
  reason: string;
  source: 'game' | 'achievement' | 'streak' | 'competition' | 'teacher_bonus';
  created_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  avatar?: string;
  xp: number;
  level: number;
  best_wpm: number;
  school?: string;
  is_current_user: boolean;
}

export const XP_REWARDS = {
  GAME_COMPLETE: 10,
  PERFECT_SESSION: 25,
  DAILY_STREAK: 5,
  WEEKLY_STREAK_BONUS: 50,
  ACHIEVEMENT_UNLOCK: 100,
  COMPETITION_WIN: 200,
  COMPETITION_PARTICIPATE: 15,
} as const;

export const LEVEL_THRESHOLDS = [
  0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000, 15000,
];
