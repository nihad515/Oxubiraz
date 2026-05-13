export interface WpmRecord {
  date: string;
  wpm: number;
  mode: string;
  language: string;
}

export interface StudentStats {
  user_id: number;
  total_sessions: number;
  total_words_read: number;
  average_wpm: number;
  best_wpm: number;
  total_time_minutes: number;
  current_streak: number;
  longest_streak: number;
  xp_total: number;
  level: number;
  sessions_today: number;
  wpm_trend: WpmRecord[];
}

export interface Analytics {
  daily: DailyStats[];
  monthly: MonthlyStats[];
  yearly: YearlyStats[];
  by_language: LanguageStats[];
  by_mode: ModeStats[];
  weakest_words: WeakestWord[];
}

export interface DailyStats {
  date: string;
  sessions: number;
  avg_wpm: number;
  total_words: number;
  active_students: number;
}

export interface MonthlyStats {
  month: string;
  year: number;
  sessions: number;
  avg_wpm: number;
  total_words: number;
}

export interface YearlyStats {
  year: number;
  sessions: number;
  avg_wpm: number;
  students_active: number;
}

export interface LanguageStats {
  language: string;
  sessions: number;
  avg_wpm: number;
  percentage: number;
}

export interface ModeStats {
  mode: string;
  sessions: number;
  avg_wpm: number;
  completion_rate: number;
}

export interface WeakestWord {
  word: string;
  language: string;
  avg_time_ms: number;
  occurrence_count: number;
}
