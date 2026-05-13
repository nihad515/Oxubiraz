export type NotificationType =
  | 'achievement_earned'
  | 'competition_started'
  | 'competition_ended'
  | 'task_assigned'
  | 'level_up'
  | 'streak_reminder'
  | 'teacher_feedback'
  | 'system'
  | 'parent_report';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read_at?: string;
  created_at: string;
}
