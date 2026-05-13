export type GameMode = 'random_words' | 'text_reading' | 'sentence_reading' | 'memory' | 'ai';
export type GameDuration = 30 | 60 | 90;
export type GameStatus = 'idle' | 'countdown' | 'playing' | 'finished' | 'paused';

export interface GameConfig {
  mode: GameMode;
  duration: GameDuration;
  language: 'az' | 'ru' | 'en';
  word_count?: number;
  text_id?: number;
  word_list_id?: number;
  difficulty?: 'beginner' | 'elementary' | 'intermediate' | 'advanced' | 'expert';
}

export interface GameWord {
  id: string;
  text: string;
  index: number;
  clicked: boolean;
  click_time?: number;
}

export interface GameSession {
  id: string;
  config: GameConfig;
  status: GameStatus;
  words: GameWord[];
  started_at?: number;
  finished_at?: number;
  elapsed_ms: number;
  clicked_count: number;
  last_clicked_index: number;
}

export interface GameResult {
  id: number;
  user_id: number;
  mode: GameMode;
  duration: GameDuration;
  language: 'az' | 'ru' | 'en';
  total_words: number;
  clicked_words: number;
  wpm: number;
  accuracy: number;
  completion_percentage: number;
  time_elapsed_ms: number;
  is_completed: boolean;
  xp_earned: number;
  word_list_id?: number;
  text_id?: number;
  created_at: string;
}

export interface WpmCalculation {
  wpm: number;
  wordsRead: number;
  timeSeconds: number;
}
