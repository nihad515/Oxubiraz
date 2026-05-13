<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('competitions', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('mode', ['random_words', 'text_reading', 'sentence_reading', 'memory', 'ai']);
            $table->enum('language', ['az', 'ru', 'en']);
            $table->unsignedTinyInteger('duration')->default(60);
            $table->foreignId('word_list_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('text_id')->nullable()->constrained('reading_texts')->nullOnDelete();
            $table->foreignId('school_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('class_id')->nullable()->constrained('school_classes')->nullOnDelete();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->timestamp('starts_at');
            $table->timestamp('ends_at');
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('max_participants')->nullable();
            $table->timestamps();

            $table->index(['is_active', 'starts_at', 'ends_at']);
        });

        Schema::create('competition_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('competition_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('joined_at');
            $table->unsignedSmallInteger('wpm')->nullable();
            $table->unsignedInteger('score')->nullable();
            $table->unsignedSmallInteger('rank')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['competition_id', 'user_id']);
            $table->index(['competition_id', 'wpm']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('competition_participants');
        Schema::dropIfExists('competitions');
    }
};
