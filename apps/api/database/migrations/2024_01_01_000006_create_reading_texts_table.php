<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reading_texts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->longText('content');
            $table->enum('language', ['az', 'ru', 'en']);
            $table->enum('difficulty', ['beginner', 'elementary', 'intermediate', 'advanced', 'expert'])->default('beginner');
            $table->enum('age_group', ['5-7', '8-10', '11-13', '14-16', '16+'])->default('8-10');
            $table->unsignedInteger('word_count')->default(0);
            $table->string('category', 100)->nullable();
            $table->json('tags')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['language', 'difficulty', 'is_active']);
            $table->fullText('content');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reading_texts');
    }
};
