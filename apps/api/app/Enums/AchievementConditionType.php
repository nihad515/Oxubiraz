<?php

namespace App\Enums;

enum AchievementConditionType: string
{
    case WpmReached = 'wpm_reached';
    case SessionsCompleted = 'sessions_completed';
    case StreakDays = 'streak_days';
    case WordsRead = 'words_read';
    case PerfectSession = 'perfect_session';
    case LanguageMastery = 'language_mastery';
    case FirstSession = 'first_session';
    case LevelReached = 'level_reached';
}
