<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('game_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('mode', ['random_words', 'text_reading', 'sentence_reading', 'memory', 'ai']);
            $table->unsignedTinyInteger('duration'); // seconds: 30, 60, 90
            $table->enum('language', ['az', 'ru', 'en']);
            $table->unsignedSmallInteger('total_words')->default(0);
            $table->unsignedSmallInteger('clicked_words')->default(0);
            $table->unsignedSmallInteger('wpm')->default(0);
            $table->decimal('accuracy', 5, 2)->default(0);
            $table->decimal('completion_percentage', 5, 2)->default(0);
            $table->unsignedInteger('time_elapsed_ms')->default(0);
            $table->boolean('is_completed')->default(false);
            $table->unsignedSmallInteger('xp_earned')->default(0);
            $table->foreignId('word_list_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('text_id')->nullable()->constrained('reading_texts')->nullOnDelete();
            $table->json('word_sequence')->nullable();
            $table->json('click_timestamps')->nullable();
            $table->json('weakest_words')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
            $table->index(['user_id', 'wpm']);
            $table->index(['user_id', 'language']);
            $table->index(['user_id', 'mode']);
            $table->index('wpm');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_sessions');
    }
};
