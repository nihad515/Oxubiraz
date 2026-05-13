export interface SystemString {
  id: number;
  string_key: string;
  group_name: StringGroupName;
  az: string;
  ru: string;
  en: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export type StringGroupName =
  | 'common'
  | 'auth'
  | 'navigation'
  | 'dashboard'
  | 'game'
  | 'admin'
  | 'teacher'
  | 'student'
  | 'parent'
  | 'errors'
  | 'validation'
  | 'notifications'
  | 'achievements'
  | 'competition'
  | 'settings'
  | 'reports';

export type StringGroup = {
  name: StringGroupName;
  label: string;
  strings: SystemString[];
};

export type StringsMap = Record<string, string>;
