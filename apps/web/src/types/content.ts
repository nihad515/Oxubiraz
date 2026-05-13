export type DifficultyLevel = 'beginner' | 'elementary' | 'intermediate' | 'advanced' | 'expert';
export type AgeGroup = '5-7' | '8-10' | '11-13' | '14-16' | '16+';
export type ContentLanguage = 'az' | 'ru' | 'en';

export interface ReadingText {
  id: number;
  title: string;
  content: string;
  language: ContentLanguage;
  difficulty: DifficultyLevel;
  age_group: AgeGroup;
  word_count: number;
  category?: string;
  tags: string[];
  is_active: boolean;
  created_by: number;
  created_at: string;
}

export interface WordList {
  id: number;
  name: string;
  language: ContentLanguage;
  difficulty: DifficultyLevel;
  age_group: AgeGroup;
  words: Word[];
  words_count: number;
  is_active: boolean;
  created_at: string;
}

export interface Word {
  id: number;
  word_list_id: number;
  text: string;
  language: ContentLanguage;
  syllable_count?: number;
  frequency?: number;
}
