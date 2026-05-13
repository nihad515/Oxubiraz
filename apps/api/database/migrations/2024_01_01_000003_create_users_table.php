<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('first_name', 50);
            $table->string('last_name', 50);
            $table->string('username', 30)->unique();
            $table->string('email', 100)->unique()->nullable();
            $table->string('phone', 30)->nullable();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->enum('locale', ['az', 'ru', 'en'])->default('az');
            $table->foreignId('school_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('class_id')->nullable()->constrained('school_classes')->nullOnDelete();
            $table->foreignId('teacher_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('xp')->default(0);
            $table->unsignedTinyInteger('level')->default(0);
            $table->unsignedSmallInteger('streak_days')->default(0);
            $table->unsignedSmallInteger('longest_streak')->default(0);
            $table->timestamp('last_played_at')->nullable();
            $table->timestamp('last_login_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('is_active');
            $table->index('school_id');
            $table->index('class_id');
            $table->index('teacher_id');
            $table->index('parent_id');
            $table->index('xp');
            $table->index('level');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
