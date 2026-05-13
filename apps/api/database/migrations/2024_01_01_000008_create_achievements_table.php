<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('achievements', function (Blueprint $table) {
            $table->id();
            $table->string('key', 100)->unique();
            $table->string('name_az');
            $table->string('name_ru');
            $table->string('name_en');
            $table->text('description_az');
            $table->text('description_ru');
            $table->text('description_en');
            $table->string('icon', 100);
            $table->string('badge_color', 30)->default('#6d28d9');
            $table->unsignedSmallInteger('xp_reward')->default(0);
            $table->enum('condition_type', [
                'wpm_reached', 'sessions_completed', 'streak_days',
                'words_read', 'perfect_session', 'language_mastery',
                'first_session', 'level_reached',
            ]);
            $table->unsignedInteger('condition_value');
            $table->boolean('is_secret')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('user_achievements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('achievement_id')->constrained()->cascadeOnDelete();
            $table->timestamp('earned_at');
            $table->timestamps();

            $table->unique(['user_id', 'achievement_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_achievements');
        Schema::dropIfExists('achievements');
    }
};
