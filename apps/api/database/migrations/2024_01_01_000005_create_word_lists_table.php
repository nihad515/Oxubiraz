<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('word_lists', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('language', ['az', 'ru', 'en']);
            $table->enum('difficulty', ['beginner', 'elementary', 'intermediate', 'advanced', 'expert'])->default('beginner');
            $table->enum('age_group', ['5-7', '8-10', '11-13', '14-16', '16+'])->default('8-10');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['language', 'difficulty', 'is_active']);
        });

        Schema::create('words', function (Blueprint $table) {
            $table->id();
            $table->foreignId('word_list_id')->constrained()->cascadeOnDelete();
            $table->string('text', 100);
            $table->enum('language', ['az', 'ru', 'en']);
            $table->unsignedTinyInteger('syllable_count')->nullable();
            $table->unsignedInteger('frequency')->nullable();
            $table->timestamps();

            $table->index(['word_list_id', 'language']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('words');
        Schema::dropIfExists('word_lists');
    }
};
