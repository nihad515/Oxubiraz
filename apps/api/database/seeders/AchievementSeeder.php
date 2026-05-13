<?php

namespace Database\Seeders;

use App\Models\Achievement;
use Illuminate\Database\Seeder;

class AchievementSeeder extends Seeder
{
    public function run(): void
    {
        $achievements = [
            [
                'name_az' => 'İlk Addım',
                'name_ru' => 'Первый шаг',
                'name_en' => 'First Step',
                'description_az' => 'İlk oyun sessiyasını tamamla',
                'description_ru' => 'Завершите первую игровую сессию',
                'description_en' => 'Complete your first game session',
                'icon' => '🎮',
                'xp_reward' => 10,
                'condition_type' => 'sessions_count',
                'condition_value' => 1,
            ],
            [
                'name_az' => 'Kitabxanaçı',
                'name_ru' => 'Библиотекарь',
                'name_en' => 'Librarian',
                'description_az' => '50 sessiya tamamla',
                'description_ru' => 'Завершите 50 сессий',
                'description_en' => 'Complete 50 sessions',
                'icon' => '📚',
                'xp_reward' => 100,
                'condition_type' => 'sessions_count',
                'condition_value' => 50,
            ],
            [
                'name_az' => 'Sürətli Oxucu',
                'name_ru' => 'Быстрый читатель',
                'name_en' => 'Speed Reader',
                'description_az' => '100 söz/dəq sürətinə çat',
                'description_ru' => 'Достигните скорости 100 слов/мин',
                'description_en' => 'Reach 100 WPM speed',
                'icon' => '⚡',
                'xp_reward' => 50,
                'condition_type' => 'wpm_reached',
                'condition_value' => 100,
            ],
            [
                'name_az' => 'Işıq Sürəti',
                'name_ru' => 'Скорость света',
                'name_en' => 'Light Speed',
                'description_az' => '200 söz/dəq sürətinə çat',
                'description_ru' => 'Достигните скорости 200 слов/мин',
                'description_en' => 'Reach 200 WPM speed',
                'icon' => '🚀',
                'xp_reward' => 200,
                'condition_type' => 'wpm_reached',
                'condition_value' => 200,
            ],
            [
                'name_az' => 'Həftə Serisi',
                'name_ru' => 'Недельная серия',
                'name_en' => 'Week Streak',
                'description_az' => '7 gün ardıcıl oyna',
                'description_ru' => '7 дней подряд играйте',
                'description_en' => 'Play 7 days in a row',
                'icon' => '🔥',
                'xp_reward' => 75,
                'condition_type' => 'streak_days',
                'condition_value' => 7,
            ],
            [
                'name_az' => 'Ay Serisi',
                'name_ru' => 'Месячная серия',
                'name_en' => 'Month Streak',
                'description_az' => '30 gün ardıcıl oyna',
                'description_ru' => '30 дней подряд играйте',
                'description_en' => 'Play 30 days in a row',
                'icon' => '💎',
                'xp_reward' => 300,
                'condition_type' => 'streak_days',
                'condition_value' => 30,
            ],
            [
                'name_az' => 'Söz Ustası',
                'name_ru' => 'Мастер слов',
                'name_en' => 'Word Master',
                'description_az' => '10,000 söz oxu',
                'description_ru' => 'Прочитайте 10 000 слов',
                'description_en' => 'Read 10,000 words',
                'icon' => '🌟',
                'xp_reward' => 150,
                'condition_type' => 'total_words',
                'condition_value' => 10000,
            ],
            [
                'name_az' => 'Mükəmməl',
                'name_ru' => 'Идеально',
                'name_en' => 'Perfect',
                'description_az' => '100% tamamlanma ilə 5 sessiya keç',
                'description_ru' => 'Завершите 5 сессий с 100% выполнением',
                'description_en' => 'Complete 5 sessions with 100% completion',
                'icon' => '🏆',
                'xp_reward' => 100,
                'condition_type' => 'perfect_session',
                'condition_value' => 5,
            ],
        ];

        foreach ($achievements as $achievement) {
            Achievement::updateOrCreate(
                ['name_en' => $achievement['name_en']],
                array_merge($achievement, ['is_active' => true])
            );
        }
    }
}
