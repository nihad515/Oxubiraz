<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Auth\PasswordController;
use App\Http\Controllers\Api\V1\Auth\EmailVerificationController;
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
use App\Http\Controllers\Api\V1\ParentController;
use App\Http\Controllers\Api\V1\PushSubscriptionController;

// ───── Health check (no auth, no rate-limit) ─────
Route::get('health', HealthController::class)->name('health');

Route::prefix('v1')->name('api.v1.')->group(function () {

    // ───── Public Routes ─────
    Route::prefix('auth')->name('auth.')->group(function () {
        Route::post('login', [AuthController::class, 'login'])->name('login')
            ->middleware('throttle:auth');
        Route::post('register', [AuthController::class, 'register'])->name('register')
            ->middleware('throttle:auth');
        Route::post('forgot-password', [PasswordController::class, 'forgot'])->name('forgot-password')
            ->middleware('throttle:auth');
        Route::post('reset-password', [PasswordController::class, 'reset'])->name('reset-password')
            ->middleware('throttle:auth');
    });

    // Public strings endpoint (before auth guard)
    Route::get('strings/locale/{locale}', [SystemStringController::class, 'byLocale'])->name('strings.by-locale');

    // Public settings
    Route::get('settings/public', [SettingsController::class, 'public'])->name('settings.public');

    // VAPID public key (unauthenticated — needed before login to subscribe)
    Route::get('push/vapid-public-key', [PushSubscriptionController::class, 'vapidPublicKey'])->name('push.vapid-key');

    // ───── Authenticated Routes ─────
    Route::middleware('auth:sanctum')->group(function () {

        // Auth
        Route::prefix('auth')->name('auth.')->group(function () {
            Route::get('me', [AuthController::class, 'me'])->name('me');
            Route::post('logout', [AuthController::class, 'logout'])->name('logout');
            Route::post('email/send', [EmailVerificationController::class, 'send'])->name('email.send');
            Route::get('email/status', [EmailVerificationController::class, 'status'])->name('email.status');
        });

        Route::get('auth/verify-email/{id}/{hash}', [EmailVerificationController::class, 'verify'])
            ->name('auth.verify-email');

        // Users — current user endpoints
        Route::prefix('users/me')->name('users.me.')->group(function () {
            Route::get('/', [UserController::class, 'me'])->name('index');
            Route::patch('/', [UserController::class, 'updateMe'])->name('update');
            Route::post('password', [UserController::class, 'updateMyPassword'])->name('password');
            Route::post('avatar', [UserController::class, 'uploadAvatar'])->name('avatar');
            Route::get('sessions', [UserController::class, 'sessions'])->name('sessions');
            Route::delete('sessions/{tokenId}', [UserController::class, 'revokeSession'])->name('sessions.revoke');
            Route::delete('sessions', [UserController::class, 'revokeAllSessions'])->name('sessions.revoke-all');
        });

        // Users — admin management
        Route::prefix('users')->name('users.')->middleware('permission:view_users')->group(function () {
            Route::get('/', [UserController::class, 'index'])->name('index');
            Route::get('{user}', [UserController::class, 'show'])->name('show');

            Route::middleware('permission:edit_users')->group(function () {
                Route::patch('{user}', [UserController::class, 'update'])->name('update');
                Route::post('{user}/toggle-active', [UserController::class, 'toggleActive'])->name('toggle-active');
                Route::post('{user}/assign-role', [UserController::class, 'assignRole'])->name('assign-role');
                Route::post('{user}/password', [UserController::class, 'updatePassword'])->name('password');
            });

            Route::middleware('permission:delete_users')->group(function () {
                Route::delete('{user}', [UserController::class, 'destroy'])->name('destroy');
            });

            Route::middleware('permission:manage_users')->group(function () {
                Route::post('{user}/restore', [UserController::class, 'restore'])->name('restore');
                Route::get('export', [UserController::class, 'export'])->name('export');
            });
        });

        // Roles
        Route::prefix('roles')->name('roles.')->middleware('permission:manage_roles')->group(function () {
            Route::get('/', [RoleController::class, 'index'])->name('index');
            Route::post('/', [RoleController::class, 'store'])->name('store');
            Route::get('{role}', [RoleController::class, 'show'])->name('show');
            Route::post('{role}/sync-permissions', [RoleController::class, 'syncPermissions'])->name('sync-permissions');
            Route::delete('{role}', [RoleController::class, 'destroy'])->name('destroy');
        });

        // Permissions
        Route::prefix('permissions')->name('permissions.')->middleware('permission:manage_roles')->group(function () {
            Route::get('/', [PermissionController::class, 'index'])->name('index');
        });

        // Schools
        Route::prefix('schools')->name('schools.')->group(function () {
            Route::get('/', [SchoolController::class, 'index'])->name('index');
            Route::get('{school}', [SchoolController::class, 'show'])->name('show');
            Route::get('{school}/classes', [SchoolController::class, 'classes'])->name('classes');

            Route::middleware('permission:manage_schools')->group(function () {
                Route::post('/', [SchoolController::class, 'store'])->name('store');
                Route::patch('{school}', [SchoolController::class, 'update'])->name('update');
                Route::delete('{school}', [SchoolController::class, 'destroy'])->name('destroy');
                Route::post('{school}/classes', [SchoolController::class, 'storeClass'])->name('classes.store');
            });
        });

        // Classes
        Route::prefix('classes')->name('classes.')->group(function () {
            Route::get('by-school', [ClassController::class, 'bySchool'])->name('by-school');
            Route::get('{class}', [ClassController::class, 'show'])->name('show');
            Route::get('{class}/students', [ClassController::class, 'students'])->name('students');

            Route::middleware('permission:manage_schools')->group(function () {
                Route::patch('{class}', [ClassController::class, 'update'])->name('update');
                Route::delete('{class}', [ClassController::class, 'destroy'])->name('destroy');
            });
        });

        // System Strings
        Route::prefix('strings')->name('strings.')->middleware('permission:manage_strings')->group(function () {
            Route::get('groups', [SystemStringController::class, 'groups'])->name('groups');
            Route::get('/', [SystemStringController::class, 'index'])->name('index');
            Route::post('/', [SystemStringController::class, 'store'])->name('store');
            Route::get('{string}', [SystemStringController::class, 'show'])->name('show');
            Route::patch('{string}', [SystemStringController::class, 'update'])->name('update');
            Route::delete('{string}', [SystemStringController::class, 'destroy'])->name('destroy');
            Route::post('bulk-update', [SystemStringController::class, 'bulkUpdate'])->name('bulk-update');
            Route::get('export', [SystemStringController::class, 'export'])->name('export');
            Route::post('import', [SystemStringController::class, 'import'])->name('import');
        });

        // Reading Texts
        Route::prefix('texts')->name('texts.')->group(function () {
            Route::get('/', [TextController::class, 'index'])->name('index');
            Route::get('{text}', [TextController::class, 'show'])->name('show');
            Route::get('random', [TextController::class, 'random'])->name('random');

            Route::middleware('permission:manage_texts')->group(function () {
                Route::post('/', [TextController::class, 'store'])->name('store');
                Route::patch('{text}', [TextController::class, 'update'])->name('update');
                Route::delete('{text}', [TextController::class, 'destroy'])->name('destroy');
            });
        });

        // Word Lists
        Route::prefix('word-lists')->name('word-lists.')->group(function () {
            Route::get('/', [WordListController::class, 'index'])->name('index');
            Route::get('{wordList}', [WordListController::class, 'show'])->name('show');
            Route::get('{wordList}/words', [WordListController::class, 'words'])->name('words');

            Route::middleware('permission:manage_words')->group(function () {
                Route::post('/', [WordListController::class, 'store'])->name('store');
                Route::patch('{wordList}', [WordListController::class, 'update'])->name('update');
                Route::delete('{wordList}', [WordListController::class, 'destroy'])->name('destroy');
                Route::post('{wordList}/words', [WordListController::class, 'addWords'])->name('add-words');
                Route::delete('{wordList}/words/{word}', [WordListController::class, 'removeWord'])->name('remove-word');
                Route::post('{wordList}/import', [WordListController::class, 'importWords'])->name('import');
                Route::get('{wordList}/export', [WordListController::class, 'exportWords'])->name('export');
            });
        });

        // Game
        Route::prefix('game')->name('game.')->middleware('permission:play_game')->group(function () {
            Route::get('config', [GameController::class, 'config'])->name('config');
            Route::get('random-words', [GameController::class, 'randomWords'])->name('random-words');
            Route::get('history', [GameController::class, 'history'])->name('history');
            Route::get('results', [GameController::class, 'results'])->name('results');
            Route::get('ai-profile', [GameController::class, 'aiProfile'])->name('ai-profile');
            Route::post('ai-coaching', [GameController::class, 'aiCoaching'])->name('ai-coaching')
                ->middleware('throttle:10,1'); // 10 requests per minute — OpenAI cost guard
            Route::post('start', [GameController::class, 'start'])->name('start')
                ->middleware('throttle:game');
            Route::post('finish', [GameController::class, 'finish'])->name('finish');
        });

        // Analytics
        Route::prefix('analytics')->name('analytics.')->group(function () {
            Route::get('me', [AnalyticsController::class, 'myStats'])->name('me');

            Route::middleware('permission:view_statistics')->group(function () {
                Route::get('overview', [AnalyticsController::class, 'overview'])->name('overview');
                Route::get('student/{user}', [AnalyticsController::class, 'studentStats'])->name('student');
                Route::get('student/{user}/report', [AnalyticsController::class, 'reportPdf'])->name('student.report');
                Route::get('daily', [AnalyticsController::class, 'daily'])->name('daily');
                Route::get('monthly', [AnalyticsController::class, 'monthly'])->name('monthly');
                Route::get('yearly', [AnalyticsController::class, 'yearly'])->name('yearly');
                Route::get('by-language', [AnalyticsController::class, 'byLanguage'])->name('by-language');
                Route::get('by-mode', [AnalyticsController::class, 'byMode'])->name('by-mode');
                Route::get('weakest-words', [AnalyticsController::class, 'weakestWords'])->name('weakest-words');
                Route::get('top-students', [AnalyticsController::class, 'topStudents'])->name('top-students');
                Route::get('school/{school}', [AnalyticsController::class, 'schoolStats'])->name('school');
                Route::get('class/{class}', [AnalyticsController::class, 'classStats'])->name('class');
                Route::get('export', [AnalyticsController::class, 'export'])->name('export');
            });
        });

        // Achievements
        Route::prefix('achievements')->name('achievements.')->group(function () {
            Route::get('me', [AchievementController::class, 'myAchievements'])->name('me');
            Route::get('/', [AchievementController::class, 'index'])->name('index');

            Route::middleware('permission:manage_achievements')->group(function () {
                Route::get('admin', [AchievementController::class, 'adminIndex'])->name('admin');
                Route::post('/', [AchievementController::class, 'store'])->name('store');
                Route::patch('{achievement}', [AchievementController::class, 'update'])->name('update');
                Route::delete('{achievement}', [AchievementController::class, 'destroy'])->name('destroy');
            });
        });

        // Leaderboard
        Route::prefix('leaderboard')->name('leaderboard.')->group(function () {
            Route::get('global', [LeaderboardController::class, 'global'])->name('global');
            Route::get('school', [LeaderboardController::class, 'school'])->name('school');
            Route::get('class', [LeaderboardController::class, 'class'])->name('class');
        });

        // Competitions
        Route::prefix('competitions')->name('competitions.')->group(function () {
            Route::get('/', [CompetitionController::class, 'index'])->name('index');
            Route::get('active', [CompetitionController::class, 'active'])->name('active');
            Route::get('{competition}', [CompetitionController::class, 'show'])->name('show');
            Route::post('{competition}/join', [CompetitionController::class, 'join'])->name('join');
            Route::get('{competition}/leaderboard', [CompetitionController::class, 'leaderboard'])->name('leaderboard');

            Route::middleware('permission:manage_competitions')->group(function () {
                Route::post('/', [CompetitionController::class, 'store'])->name('store');
                Route::patch('{competition}', [CompetitionController::class, 'update'])->name('update');
                Route::delete('{competition}', [CompetitionController::class, 'destroy'])->name('destroy');
            });
        });

        // Notifications
        Route::prefix('notifications')->name('notifications.')->group(function () {
            Route::get('/', [NotificationController::class, 'index'])->name('index');
            Route::get('unread-count', [NotificationController::class, 'unreadCount'])->name('unread-count');
            Route::post('{id}/read', [NotificationController::class, 'markRead'])->name('mark-read');
            Route::post('read-all', [NotificationController::class, 'markAllRead'])->name('mark-all-read');
            Route::delete('{id}', [NotificationController::class, 'destroy'])->name('destroy');
            Route::delete('/', [NotificationController::class, 'destroyAll'])->name('destroy-all');
            Route::post('broadcast', [NotificationController::class, 'broadcast'])
                ->name('broadcast')
                ->middleware('permission:manage_settings');
        });

        // Push subscriptions
        Route::prefix('push')->name('push.')->group(function () {
            Route::post('subscribe', [PushSubscriptionController::class, 'store'])->name('subscribe');
            Route::delete('subscribe', [PushSubscriptionController::class, 'destroy'])->name('unsubscribe');
        });

        // Parent
        Route::prefix('parent')->name('parent.')->middleware('permission:view_children')->group(function () {
            Route::get('children', [ParentController::class, 'children'])->name('children');
            Route::get('children/{user}', [ParentController::class, 'childStats'])->name('child-stats');
        });

        // Audit Logs
        Route::prefix('audit-logs')->name('audit-logs.')->middleware('permission:manage_settings')->group(function () {
            Route::get('/', [AuditLogController::class, 'index'])->name('index');
            Route::get('export', [AuditLogController::class, 'export'])->name('export');
            Route::get('{id}', [AuditLogController::class, 'show'])->name('show');
        });

        // Settings
        Route::prefix('settings')->name('settings.')->group(function () {
            Route::get('/', [SettingsController::class, 'index'])->name('index');
            Route::middleware('permission:manage_settings')->group(function () {
                Route::patch('/', [SettingsController::class, 'update'])->name('update');
            });
        });
    });
});
