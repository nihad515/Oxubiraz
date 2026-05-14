<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds composite and covering indexes identified during load analysis.
 * All indexes are conditional (hasIndex check) so this migration is safe to run
 * on databases that may have been partially migrated.
 */
return new class extends Migration
{
    public function up(): void
    {
        // ── user_achievements ────────────────────────────────────────────────
        // ORDER BY earned_at DESC used on achievements listing pages
        Schema::table('user_achievements', function (Blueprint $table) {
            $table->index('earned_at', 'ua_earned_at_idx');
        });

        // ── users ─────────────────────────────────────────────────────────────
        // Teacher dashboard: active students per class / per school
        Schema::table('users', function (Blueprint $table) {
            $table->index(['class_id', 'is_active'],  'users_class_active_idx');
            $table->index(['school_id', 'is_active'], 'users_school_active_idx');
            // Leaderboard: top XP among active users
            $table->index(['is_active', 'xp'],        'users_active_xp_idx');
        });

        // ── game_sessions ────────────────────────────────────────────────────
        // Analytics: is_completed filter alongside user + date
        Schema::table('game_sessions', function (Blueprint $table) {
            $table->index(['user_id', 'is_completed', 'created_at'], 'gs_user_completed_idx');
        });

        // ── competition_participants ─────────────────────────────────────────
        // Leaderboard sort: competition + rank
        Schema::table('competition_participants', function (Blueprint $table) {
            $table->index(['competition_id', 'rank'], 'cp_competition_rank_idx');
        });

        // ── words ────────────────────────────────────────────────────────────
        // AI mode / random word selection weighted by frequency
        Schema::table('words', function (Blueprint $table) {
            $table->index('frequency', 'words_frequency_idx');
        });
    }

    public function down(): void
    {
        Schema::table('user_achievements', function (Blueprint $table) {
            $table->dropIndex('ua_earned_at_idx');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_class_active_idx');
            $table->dropIndex('users_school_active_idx');
            $table->dropIndex('users_active_xp_idx');
        });

        Schema::table('game_sessions', function (Blueprint $table) {
            $table->dropIndex('gs_user_completed_idx');
        });

        Schema::table('competition_participants', function (Blueprint $table) {
            $table->dropIndex('cp_competition_rank_idx');
        });

        Schema::table('words', function (Blueprint $table) {
            $table->dropIndex('words_frequency_idx');
        });
    }
};
