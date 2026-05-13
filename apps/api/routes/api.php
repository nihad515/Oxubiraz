<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Auth\PasswordController;
use App\Http\Controllers\Api\V1\Auth\EmailVerificationController;
use App\Http\Controllers\Api\V1\Auth\SessionController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\RoleController;
use App\Http\Controllers\Api\V1\PermissionController;
use App\Http\Controllers\Api\V1\SchoolController;
use App\Http\Controllers\Api\V1\ClassController;
use App\Http\Controllers\Api\V1\SystemStringController;
use App\Http\Controllers\Api\V1\TextController;
use App\Http\Controllers\Api\V1\WordListController;
use App\Http\Controllers\Api\V1\GameController;
use App\Http\Controllers\Api\V1\Analytics\AnalyticsController;
use App\Http\Controllers\Api\V1\AchievementController;
use App\Http\Controllers\Api\V1\LeaderboardController;
use App\Http\Controllers\Api\V1\CompetitionController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\AuditLogController;
use App\Http\Controllers\Api\V1\SettingsController;

Route::prefix('v1')->name('api.v1.')->group(function () {

    // ───── Public Auth Routes ─────
    Route::prefix('auth')->name('auth.')->group(function () {
        Route::post('login', [AuthController::class, 'login'])->name('login')
            ->middleware('throttle:auth');
        Route::post('register', [AuthController::class, 'register'])->name('register')
            ->middleware('throttle:auth');
        Route::post('forgot-password', [PasswordController::class, 'forgotPassword'])->name('forgot-password')
            ->middleware('throttle:auth');
        Route::post('reset-password', [PasswordController::class, 'resetPassword'])->name('reset-password')
            ->middleware('throttle:auth');
    });

    // ───── Authenticated Routes ─────
    Route::middleware(['auth:sanctum', 'verified.optional'])->group(function () {

        // Auth
        Route::prefix('auth')->name('auth.')->group(function () {
            Route::get('me', [AuthController::class, 'me'])->name('me');
            Route::post('logout', [AuthController::class, 'logout'])->name('logout');
            Route::post('verify-email', [EmailVerificationController::class, 'verify'])->name('verify-email');
            Route::post('resend-verification', [EmailVerificationController::class, 'resend'])->name('resend-verification');
            Route::get('sessions', [SessionController::class, 'index'])->name('sessions');
            Route::delete('sessions/{sessionId}', [SessionController::class, 'revoke'])->name('sessions.revoke');
        });

        // Users
        Route::prefix('users')->name('users.')->group(function () {
            Route::get('profile', [UserController::class, 'profile'])->name('profile');
            Route::put('profile', [UserController::class, 'updateProfile'])->name('profile.update');
            Route::post('profile/avatar', [UserController::class, 'uploadAvatar'])->name('avatar');
            Route::put('change-password', [UserController::class, 'changePassword'])->name('change-password');

            Route::middleware('permission:view_users')->group(function () {
                Route::get('/', [UserController::class, 'index'])->name('index');
                Route::get('{user}', [UserController::class, 'show'])->name('show');
            });
            Route::middleware('permission:create_users')->group(function () {
                Route::post('/', [UserController::class, 'store'])->name('store');
            });
            Route::middleware('permission:edit_users')->group(function () {
                Route::put('{user}', [UserController::class, 'update'])->name('update');
                Route::patch('{user}', [UserController::class, 'update']);
                Route::post('{user}/avatar', [UserController::class, 'updateAvatar'])->name('user-avatar');
            });
            Route::middleware('permission:delete_users')->group(function () {
                Route::delete('{user}', [UserController::class, 'destroy'])->name('destroy');
                Route::post('bulk-delete', [UserController::class, 'bulkDelete'])->name('bulk-delete');
            });
            Route::middleware('permission:manage_users')->group(function () {
                Route::post('bulk-activate', [UserController::class, 'bulkActivate'])->name('bulk-activate');
                Route::get('export', [UserController::class, 'export'])->name('export');
            });
        });

        // Roles
        Route::prefix('roles')->name('roles.')->middleware('permission:manage_roles')->group(function () {
            Route::get('/', [RoleController::class, 'index'])->name('index');
            Route::post('/', [RoleController::class, 'store'])->name('store');
            Route::get('{role}', [RoleController::class, 'show'])->name('show');
            Route::put('{role}', [RoleController::class, 'update'])->name('update');
            Route::delete('{role}', [RoleController::class, 'destroy'])->name('destroy');
            Route::put('{role}/permissions', [RoleController::class, 'syncPermissions'])->name('permissions');
        });

        // Permissions
        Route::prefix('permissions')->name('permissions.')->middleware('permission:manage_roles')->group(function () {
            Route::get('/', [PermissionController::class, 'index'])->name('index');
            Route::get('groups', [PermissionController::class, 'groups'])->name('groups');
        });

        // Schools
        Route::prefix('schools')->name('schools.')->group(function () {
            Route::get('/', [SchoolController::class, 'index'])->name('index');
            Route::get('{school}', [SchoolController::class, 'show'])->name('show');
            Route::middleware('permission:manage_schools')->group(function () {
                Route::post('/', [SchoolController::class, 'store'])->name('store');
                Route::put('{school}', [SchoolController::class, 'update'])->name('update');
                Route::delete('{school}', [SchoolController::class, 'destroy'])->name('destroy');
            });
            Route::get('{school}/classes', [SchoolController::class, 'classes'])->name('classes');
            Route::get('{school}/teachers', [SchoolController::class, 'teachers'])->name('teachers');
            Route::get('{school}/students', [SchoolController::class, 'students'])->name('students');
        });

        // Classes
        Route::prefix('classes')->name('classes.')->group(function () {
            Route::get('/', [ClassController::class, 'index'])->name('index');
            Route::get('{class}', [ClassController::class, 'show'])->name('show');
            Route::middleware('permission:manage_schools')->group(function () {
                Route::post('/', [ClassController::class, 'store'])->name('store');
                Route::put('{class}', [ClassController::class, 'update'])->name('update');
                Route::delete('{class}', [ClassController::class, 'destroy'])->name('destroy');
            });
            Route::get('{class}/students', [ClassController::class, 'students'])->name('students');
        });

        // System Strings (i18n)
        Route::prefix('strings')->name('strings.')->group(function () {
            Route::get('locale/{locale}', [SystemStringController::class, 'byLocale'])->name('by-locale')
                ->withoutMiddleware(['auth:sanctum']);
            Route::get('groups', [SystemStringController::class, 'groups'])->name('groups');

            Route::middleware('permission:manage_strings')->group(function () {
                Route::get('/', [SystemStringController::class, 'index'])->name('index');
                Route::post('/', [SystemStringController::class, 'store'])->name('store');
                Route::get('{string}', [SystemStringController::class, 'show'])->name('show');
                Route::put('{string}', [SystemStringController::class, 'update'])->name('update');
                Route::delete('{string}', [SystemStringController::class, 'destroy'])->name('destroy');
                Route::post('bulk-update', [SystemStringController::class, 'bulkUpdate'])->name('bulk-update');
                Route::get('export', [SystemStringController::class, 'export'])->name('export');
                Route::post('import', [SystemStringController::class, 'import'])->name('import');
            });
        });

        // Reading Texts
        Route::prefix('texts')->name('texts.')->group(function () {
            Route::get('/', [TextController::class, 'index'])->name('index');
            Route::get('{text}', [TextController::class, 'show'])->name('show');
            Route::middleware('permission:manage_texts')->group(function () {
                Route::post('/', [TextController::class, 'store'])->name('store');
                Route::put('{text}', [TextController::class, 'update'])->name('update');
                Route::delete('{text}', [TextController::class, 'destroy'])->name('destroy');
                Route::post('bulk-delete', [TextController::class, 'bulkDelete'])->name('bulk-delete');
                Route::get('export', [TextController::class, 'export'])->name('export');
                Route::post('import', [TextController::class, 'import'])->name('import');
            });
        });

        // Word Lists
        Route::prefix('word-lists')->name('word-lists.')->group(function () {
            Route::get('/', [WordListController::class, 'index'])->name('index');
            Route::get('{list}', [WordListController::class, 'show'])->name('show');
            Route::get('{list}/words', [WordListController::class, 'words'])->name('words');
            Route::middleware('permission:manage_words')->group(function () {
                Route::post('/', [WordListController::class, 'store'])->name('store');
                Route::put('{list}', [WordListController::class, 'update'])->name('update');
                Route::delete('{list}', [WordListController::class, 'destroy'])->name('destroy');
                Route::post('{list}/words', [WordListController::class, 'addWord'])->name('add-word');
                Route::delete('{list}/words/{word}', [WordListController::class, 'removeWord'])->name('remove-word');
                Route::post('{list}/import', [WordListController::class, 'importWords'])->name('import');
            });
        });

        // Game
        Route::prefix('game')->name('game.')->middleware('permission:play_game')->group(function () {
            Route::post('start', [GameController::class, 'start'])->name('start')
                ->middleware('throttle:game');
            Route::post('finish', [GameController::class, 'finish'])->name('finish');
            Route::get('config', [GameController::class, 'config'])->name('config');
            Route::get('history', [GameController::class, 'history'])->name('history');
            Route::get('results', [GameController::class, 'results'])->name('results');
            Route::get('random-words', [GameController::class, 'randomWords'])->name('random-words');
        });

        // Analytics
        Route::prefix('analytics')->name('analytics.')->group(function () {
            Route::get('me', [AnalyticsController::class, 'myStats'])->name('me');
            Route::middleware('permission:view_statistics')->group(function () {
                Route::get('overview', [AnalyticsController::class, 'overview'])->name('overview');
                Route::get('student/{user}', [AnalyticsController::class, 'studentStats'])->name('student');
                Route::get('daily', [AnalyticsController::class, 'daily'])->name('daily');
                Route::get('monthly', [AnalyticsController::class, 'monthly'])->name('monthly');
                Route::get('yearly', [AnalyticsController::class, 'yearly'])->name('yearly');
                Route::get('by-language', [AnalyticsController::class, 'byLanguage'])->name('by-language');
                Route::get('by-mode', [AnalyticsController::class, 'byMode'])->name('by-mode');
                Route::get('weakest-words', [AnalyticsController::class, 'weakestWords'])->name('weakest-words');
                Route::get('top-students', [AnalyticsController::class, 'topStudents'])->name('top-students');
                Route::get('school/{school}', [AnalyticsController::class, 'schoolStats'])->name('school');
                Route::get('class/{class}', [AnalyticsController::class, 'classStats'])->name('class');
            });
            Route::middleware('permission:export_reports')->group(function () {
                Route::get('export', [AnalyticsController::class, 'export'])->name('export');
            });
        });

        // Achievements
        Route::prefix('achievements')->name('achievements.')->group(function () {
            Route::get('me', [AchievementController::class, 'myAchievements'])->name('me');
            Route::middleware('permission:manage_achievements')->group(function () {
                Route::get('/', [AchievementController::class, 'index'])->name('index');
                Route::post('/', [AchievementController::class, 'store'])->name('store');
                Route::put('{achievement}', [AchievementController::class, 'update'])->name('update');
                Route::delete('{achievement}', [AchievementController::class, 'destroy'])->name('destroy');
            });
        });

        // Leaderboard
        Route::prefix('leaderboard')->name('leaderboard.')->group(function () {
            Route::get('global', [LeaderboardController::class, 'global'])->name('global');
            Route::get('school/{school}', [LeaderboardController::class, 'school'])->name('school');
            Route::get('class/{class}', [LeaderboardController::class, 'class'])->name('class');
        });

        // Competitions
        Route::prefix('competitions')->name('competitions.')->group(function () {
            Route::get('/', [CompetitionController::class, 'index'])->name('index');
            Route::get('{competition}', [CompetitionController::class, 'show'])->name('show');
            Route::post('{competition}/join', [CompetitionController::class, 'join'])->name('join');
            Route::get('{competition}/results', [CompetitionController::class, 'results'])->name('results');
            Route::get('{competition}/leaderboard', [CompetitionController::class, 'leaderboard'])->name('leaderboard');
            Route::middleware('permission:manage_competitions')->group(function () {
                Route::post('/', [CompetitionController::class, 'store'])->name('store');
                Route::put('{competition}', [CompetitionController::class, 'update'])->name('update');
                Route::delete('{competition}', [CompetitionController::class, 'destroy'])->name('destroy');
            });
        });

        // Notifications
        Route::prefix('notifications')->name('notifications.')->group(function () {
            Route::get('/', [NotificationController::class, 'index'])->name('index');
            Route::get('unread-count', [NotificationController::class, 'unreadCount'])->name('unread-count');
            Route::patch('{id}/read', [NotificationController::class, 'markRead'])->name('mark-read');
            Route::post('read-all', [NotificationController::class, 'markAllRead'])->name('mark-all-read');
            Route::delete('{id}', [NotificationController::class, 'destroy'])->name('destroy');
            Route::middleware('permission:manage_notifications')->group(function () {
                Route::post('broadcast', [NotificationController::class, 'broadcast'])->name('broadcast');
            });
        });

        // Audit Logs
        Route::prefix('audit-logs')->name('audit-logs.')->middleware('permission:manage_settings')->group(function () {
            Route::get('/', [AuditLogController::class, 'index'])->name('index');
            Route::get('export', [AuditLogController::class, 'export'])->name('export');
        });

        // Settings
        Route::prefix('settings')->name('settings.')->group(function () {
            Route::get('/', [SettingsController::class, 'index'])->name('index');
            Route::middleware('permission:manage_settings')->group(function () {
                Route::put('/', [SettingsController::class, 'update'])->name('update');
            });
        });
    });
});
