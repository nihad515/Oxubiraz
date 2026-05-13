<?php

namespace Database\Seeders;

use App\Models\SystemString;
use Illuminate\Database\Seeder;

class SystemStringSeeder extends Seeder
{
    public function run(): void
    {
        $strings = [
            // Auth
            ['key' => 'auth.login', 'group' => 'auth', 'az' => 'Daxil ol', 'ru' => 'Войти', 'en' => 'Login'],
            ['key' => 'auth.logout', 'group' => 'auth', 'az' => 'Çıxış', 'ru' => 'Выйти', 'en' => 'Logout'],
            ['key' => 'auth.register', 'group' => 'auth', 'az' => 'Qeydiyyat', 'ru' => 'Регистрация', 'en' => 'Register'],
            ['key' => 'auth.login_success', 'group' => 'auth', 'az' => 'Uğurla daxil oldunuz', 'ru' => 'Вход выполнен успешно', 'en' => 'Logged in successfully'],
            ['key' => 'auth.login_failed', 'group' => 'auth', 'az' => 'Giriş məlumatları yanlışdır', 'ru' => 'Неверные данные для входа', 'en' => 'Invalid credentials'],
            ['key' => 'auth.register_success', 'group' => 'auth', 'az' => 'Uğurla qeydiyyatdan keçdiniz', 'ru' => 'Регистрация прошла успешно', 'en' => 'Registered successfully'],
            ['key' => 'auth.register_failed', 'group' => 'auth', 'az' => 'Qeydiyyat uğursuz oldu', 'ru' => 'Регистрация не удалась', 'en' => 'Registration failed'],
            ['key' => 'auth.logout_success', 'group' => 'auth', 'az' => 'Uğurla çıxış etdiniz', 'ru' => 'Вы вышли из системы', 'en' => 'Logged out successfully'],
            ['key' => 'auth.forgot_password', 'group' => 'auth', 'az' => 'Şifrəni unutdum', 'ru' => 'Забыли пароль', 'en' => 'Forgot password'],
            ['key' => 'auth.reset_password', 'group' => 'auth', 'az' => 'Şifrəni yenilə', 'ru' => 'Сбросить пароль', 'en' => 'Reset password'],
            ['key' => 'auth.email', 'group' => 'auth', 'az' => 'Email', 'ru' => 'Электронная почта', 'en' => 'Email'],
            ['key' => 'auth.username', 'group' => 'auth', 'az' => 'İstifadəçi adı', 'ru' => 'Имя пользователя', 'en' => 'Username'],
            ['key' => 'auth.password', 'group' => 'auth', 'az' => 'Şifrə', 'ru' => 'Пароль', 'en' => 'Password'],
            ['key' => 'auth.remember_me', 'group' => 'auth', 'az' => 'Məni xatırla', 'ru' => 'Запомни меня', 'en' => 'Remember me'],

            // Common
            ['key' => 'common.save', 'group' => 'common', 'az' => 'Saxla', 'ru' => 'Сохранить', 'en' => 'Save'],
            ['key' => 'common.cancel', 'group' => 'common', 'az' => 'Ləğv et', 'ru' => 'Отмена', 'en' => 'Cancel'],
            ['key' => 'common.delete', 'group' => 'common', 'az' => 'Sil', 'ru' => 'Удалить', 'en' => 'Delete'],
            ['key' => 'common.edit', 'group' => 'common', 'az' => 'Redaktə et', 'ru' => 'Редактировать', 'en' => 'Edit'],
            ['key' => 'common.create', 'group' => 'common', 'az' => 'Yarat', 'ru' => 'Создать', 'en' => 'Create'],
            ['key' => 'common.search', 'group' => 'common', 'az' => 'Axtar', 'ru' => 'Поиск', 'en' => 'Search'],
            ['key' => 'common.filter', 'group' => 'common', 'az' => 'Filtr', 'ru' => 'Фильтр', 'en' => 'Filter'],
            ['key' => 'common.export', 'group' => 'common', 'az' => 'İxrac et', 'ru' => 'Экспорт', 'en' => 'Export'],
            ['key' => 'common.import', 'group' => 'common', 'az' => 'İdxal et', 'ru' => 'Импорт', 'en' => 'Import'],
            ['key' => 'common.loading', 'group' => 'common', 'az' => 'Yüklənir...', 'ru' => 'Загрузка...', 'en' => 'Loading...'],
            ['key' => 'common.no_data', 'group' => 'common', 'az' => 'Məlumat yoxdur', 'ru' => 'Нет данных', 'en' => 'No data'],
            ['key' => 'common.confirm_delete', 'group' => 'common', 'az' => 'Silməyə əminsinizmi?', 'ru' => 'Вы уверены, что хотите удалить?', 'en' => 'Are you sure you want to delete?'],
            ['key' => 'common.success', 'group' => 'common', 'az' => 'Uğurlu', 'ru' => 'Успешно', 'en' => 'Success'],
            ['key' => 'common.error', 'group' => 'common', 'az' => 'Xəta', 'ru' => 'Ошибка', 'en' => 'Error'],

            // Game
            ['key' => 'game.start', 'group' => 'game', 'az' => 'Başla', 'ru' => 'Начать', 'en' => 'Start'],
            ['key' => 'game.finish', 'group' => 'game', 'az' => 'Bitir', 'ru' => 'Завершить', 'en' => 'Finish'],
            ['key' => 'game.pause', 'group' => 'game', 'az' => 'Dayandır', 'ru' => 'Пауза', 'en' => 'Pause'],
            ['key' => 'game.wpm', 'group' => 'game', 'az' => 'Söz/dəq', 'ru' => 'Слов/мин', 'en' => 'WPM'],
            ['key' => 'game.select_mode', 'group' => 'game', 'az' => 'Rejimi seçin', 'ru' => 'Выберите режим', 'en' => 'Select mode'],
            ['key' => 'game.select_duration', 'group' => 'game', 'az' => 'Müddəti seçin', 'ru' => 'Выберите длительность', 'en' => 'Select duration'],
            ['key' => 'game.random_words', 'group' => 'game', 'az' => 'Təsadüfi sözlər', 'ru' => 'Случайные слова', 'en' => 'Random words'],
            ['key' => 'game.text_reading', 'group' => 'game', 'az' => 'Mətn oxuma', 'ru' => 'Чтение текста', 'en' => 'Text reading'],
            ['key' => 'game.ai_mode', 'group' => 'game', 'az' => 'AI rejimi', 'ru' => 'Режим ИИ', 'en' => 'AI mode'],
            ['key' => 'game.finished', 'group' => 'game', 'az' => 'Oyun bitdi! :wpm söz/dəqiqə', 'ru' => 'Игра завершена! :wpm слов/мин', 'en' => 'Game finished! :wpm WPM'],
            ['key' => 'game.start_failed', 'group' => 'game', 'az' => 'Oyun başladıla bilmədi', 'ru' => 'Не удалось начать игру', 'en' => 'Failed to start game'],
            ['key' => 'game.click_words', 'group' => 'game', 'az' => 'Sözlərə sırayla klikləyin', 'ru' => 'Нажимайте слова по порядку', 'en' => 'Click words in order'],
            ['key' => 'game.countdown', 'group' => 'game', 'az' => 'Hazır olun...', 'ru' => 'Приготовьтесь...', 'en' => 'Get ready...'],

            // Navigation
            ['key' => 'nav.dashboard', 'group' => 'navigation', 'az' => 'İdarə paneli', 'ru' => 'Панель управления', 'en' => 'Dashboard'],
            ['key' => 'nav.students', 'group' => 'navigation', 'az' => 'Şagirdlər', 'ru' => 'Ученики', 'en' => 'Students'],
            ['key' => 'nav.teachers', 'group' => 'navigation', 'az' => 'Müəllimlər', 'ru' => 'Учителя', 'en' => 'Teachers'],
            ['key' => 'nav.analytics', 'group' => 'navigation', 'az' => 'Analitika', 'ru' => 'Аналитика', 'en' => 'Analytics'],
            ['key' => 'nav.settings', 'group' => 'navigation', 'az' => 'Parametrlər', 'ru' => 'Настройки', 'en' => 'Settings'],
            ['key' => 'nav.play', 'group' => 'navigation', 'az' => 'Oyna', 'ru' => 'Играть', 'en' => 'Play'],
            ['key' => 'nav.achievements', 'group' => 'navigation', 'az' => 'Nailiyyətlər', 'ru' => 'Достижения', 'en' => 'Achievements'],
            ['key' => 'nav.leaderboard', 'group' => 'navigation', 'az' => 'Liderlik cədvəli', 'ru' => 'Таблица лидеров', 'en' => 'Leaderboard'],

            // Errors
            ['key' => 'errors.forbidden', 'group' => 'errors', 'az' => 'Giriş qadağandır', 'ru' => 'Доступ запрещён', 'en' => 'Access forbidden'],
            ['key' => 'errors.not_found', 'group' => 'errors', 'az' => 'Tapılmadı', 'ru' => 'Не найдено', 'en' => 'Not found'],
            ['key' => 'errors.rate_limit', 'group' => 'errors', 'az' => 'Çox tez sorğu', 'ru' => 'Слишком много запросов', 'en' => 'Too many requests'],
            ['key' => 'errors.server_error', 'group' => 'errors', 'az' => 'Server xətası', 'ru' => 'Ошибка сервера', 'en' => 'Server error'],

            // Validation
            ['key' => 'validation.required', 'group' => 'validation', 'az' => 'Bu sahə mütləqdir', 'ru' => 'Это поле обязательно', 'en' => 'This field is required'],
            ['key' => 'validation.email_invalid', 'group' => 'validation', 'az' => 'Yanlış email', 'ru' => 'Неверный email', 'en' => 'Invalid email'],
            ['key' => 'validation.password_min', 'group' => 'validation', 'az' => 'Şifrə ən az 8 simvol olmalıdır', 'ru' => 'Пароль должен содержать не менее 8 символов', 'en' => 'Password must be at least 8 characters'],
            ['key' => 'validation.password_mismatch', 'group' => 'validation', 'az' => 'Şifrələr uyğun gəlmir', 'ru' => 'Пароли не совпадают', 'en' => 'Passwords do not match'],
            ['key' => 'validation.username_format', 'group' => 'validation', 'az' => 'Yalnız hərflər, rəqəmlər və _ işarəsi', 'ru' => 'Только буквы, цифры и _', 'en' => 'Only letters, numbers and _'],

            // Achievements
            ['key' => 'achievement.earned', 'group' => 'achievements', 'az' => 'Nailiyyət qazandınız!', 'ru' => 'Достижение получено!', 'en' => 'Achievement earned!'],
            ['key' => 'achievement.xp_earned', 'group' => 'achievements', 'az' => '+:xp XP qazandınız', 'ru' => '+:xp XP получено', 'en' => '+:xp XP earned'],
        ];

        foreach ($strings as $string) {
            SystemString::updateOrCreate(
                ['string_key' => $string['key']],
                [
                    'group_name' => $string['group'],
                    'az' => $string['az'],
                    'ru' => $string['ru'],
                    'en' => $string['en'],
                ]
            );
        }

        $this->command->info('System strings seeded successfully.');
    }
}
